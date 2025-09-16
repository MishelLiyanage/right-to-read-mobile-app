
export interface SpeechMark {
  time: number;
  type: string;
  start: number;
  end: number;
  value: string;
}

export interface BlockHighlightData {
  blockId: number;
  text: string;
  words: string[];
  bounding_boxes: number[][][];
  speechMarks: SpeechMark[];
}

class HighlightDataService {
  private speechMarksCache: Map<number, SpeechMark[]> = new Map();
  private blockDataCache: Map<number, any> = new Map();

  async loadSpeechMarks(blockId: number): Promise<SpeechMark[]> {
    if (this.speechMarksCache.has(blockId)) {
      return this.speechMarksCache.get(blockId)!;
    }

    try {
      // Speech marks files are in JSONL format and need to be imported as raw text
      // We'll use a different approach - store the data directly as arrays
      let speechMarksData: SpeechMark[] = [];
      
      switch (blockId) {
        case 2:
          speechMarksData = [
            {"time":6,"type":"word","start":28,"end":34,"value":"Listen"},
            {"time":454,"type":"word","start":35,"end":38,"value":"and"},
            {"time":628,"type":"word","start":39,"end":42,"value":"say"}
          ];
          break;
        case 3:
          speechMarksData = [
            {"time":6,"type":"word","start":28,"end":33,"value":"Grade"},
            {"time":321,"type":"word","start":34,"end":35,"value":"3"}
          ];
          break;
        case 4:
          speechMarksData = [
            {"time":6,"type":"word","start":28,"end":33,"value":"Grade"},
            {"time":331,"type":"word","start":34,"end":35,"value":"4"}
          ];
          break;
        case 5:
          speechMarksData = [
            {"time":6,"type":"word","start":28,"end":33,"value":"Grade"},
            {"time":307,"type":"word","start":34,"end":35,"value":"5"}
          ];
          break;
        case 6:
          speechMarksData = [
            {"time":6,"type":"word","start":28,"end":33,"value":"Grade"},
            {"time":350,"type":"word","start":34,"end":35,"value":"6"}
          ];
          break;
        case 7:
          speechMarksData = [
            {"time":6,"type":"word","start":28,"end":31,"value":"I'm"},
            {"time":188,"type":"word","start":32,"end":34,"value":"in"},
            {"time":309,"type":"word","start":35,"end":40,"value":"grade"},
            {"time":682,"type":"word","start":41,"end":45,"value":"five"}
          ];
          break;
        case 8:
          speechMarksData = [
            {"time":6,"type":"word","start":28,"end":31,"value":"I'm"},
            {"time":178,"type":"word","start":32,"end":34,"value":"in"},
            {"time":325,"type":"word","start":35,"end":40,"value":"grade"},
            {"time":674,"type":"word","start":41,"end":44,"value":"six"}
          ];
          break;
        case 9:
          speechMarksData = [
            {"time":6,"type":"word","start":0,"end":3,"value":"I'm"},
            {"time":257,"type":"word","start":4,"end":6,"value":"in"},
            {"time":380,"type":"word","start":7,"end":12,"value":"grade"},
            {"time":635,"type":"word","start":13,"end":19,"value":"three."},
            {"time":958,"type":"word","start":20,"end":23,"value":"I'm"},
            {"time":1154,"type":"word","start":24,"end":26,"value":"in"},
            {"time":1277,"type":"word","start":27,"end":32,"value":"grade"},
            {"time":1532,"type":"word","start":33,"end":38,"value":"four."}
          ];
          break;
        case 10:
          speechMarksData = [
            {"time":6,"type":"word","start":0,"end":4,"value":"What"},
            {"time":317,"type":"word","start":5,"end":10,"value":"grade"},
            {"time":572,"type":"word","start":11,"end":14,"value":"are"},
            {"time":760,"type":"word","start":15,"end":18,"value":"you"},
            {"time":949,"type":"word","start":19,"end":22,"value":"in?"}
          ];
          break;
        default:
          console.warn(`No speech marks found for block ${blockId}`);
          return [];
      }

      // Filter only word-type speech marks and sort by time
      const wordSpeechMarks = speechMarksData
        .filter(mark => mark.type === 'word')
        .sort((a, b) => a.time - b.time);

      this.speechMarksCache.set(blockId, wordSpeechMarks);
      console.log(`Loaded ${wordSpeechMarks.length} speech marks for block ${blockId}`);
      return wordSpeechMarks;
    } catch (error) {
      console.error(`Failed to load speech marks for block ${blockId}:`, error);
      return [];
    }
  }

  async loadBlockData(pageNumber: number): Promise<any> {
    const cacheKey = pageNumber;
    if (this.blockDataCache.has(cacheKey)) {
      return this.blockDataCache.get(cacheKey)!;
    }

    try {
      // Dynamically load block data based on page number
      let blockData;
      switch (pageNumber) {
        case 19:
          blockData = require('@/data/grade_3_english_book_page_19/grade_3_english_book.pdf_page_19_blocks.json');
          break;
        case 20:
          blockData = require('@/data/grade_3_english_book_page_20/grade_3_english_book.pdf_page_20_blocks.json');
          break;
        case 21:
          blockData = require('@/data/grade_3_english_book_page_21/grade_3_english_book.pdf_page_21_blocks.json');
          break;
        default:
          console.warn(`No block data available for page ${pageNumber}`);
          return {};
      }
      
      console.log(`Loaded block data for page ${pageNumber} with keys:`, Object.keys(blockData));
      this.blockDataCache.set(cacheKey, blockData);
      return blockData;
    } catch (error) {
      console.error(`Failed to load block data for page ${pageNumber}:`, error);
      return {};
    }
  }

  async getBlockHighlightData(blockId: number, pageNumber: number): Promise<BlockHighlightData | null> {
    try {
      console.log(`Loading highlight data for block ${blockId} on page ${pageNumber}`);
      
      const [speechMarks, allBlockData] = await Promise.all([
        this.loadSpeechMarks(blockId),
        this.loadBlockData(pageNumber)
      ]);

      console.log(`Speech marks loaded: ${speechMarks.length} items`);
      console.log(`Block data keys:`, Object.keys(allBlockData));
      
      const blockData = allBlockData[blockId.toString()];
      console.log(`Block data for ${blockId}:`, blockData);
      
      if (!blockData) {
        console.warn(`No block data found for block ${blockId}`);
        return null;
      }

      return {
        blockId,
        text: blockData.text,
        words: blockData.words,
        bounding_boxes: blockData.bounding_boxes,
        speechMarks
      };
    } catch (error) {
      console.error(`Failed to get highlight data for block ${blockId}:`, error);
      return null;
    }
  }

  clearCache() {
    this.speechMarksCache.clear();
    this.blockDataCache.clear();
  }
}

export const highlightDataService = new HighlightDataService();
