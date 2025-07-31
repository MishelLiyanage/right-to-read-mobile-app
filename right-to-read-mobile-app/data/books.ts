import { Book } from '@/types/book';

export const getAllBooks = (): Book[] => {
  return [
    {
      id: 1,
      title: 'Grade 3 English Book',
      author: 'Ministry of Education',
      backgroundColor: '#4A90E2',
      hasData: true,
      pages: [
        {
          pageNumber: 19,
          image: require('@/data/grade_3_english_book_page_19/grade_3_english_book.pdf_page_19.png'),
          blocks: [
            {
              id: 2,
              text: "Listen and say.",
              audio: require('@/data/grade_3_english_book_page_19/block_2_audio.mp3'),
            },
            {
              id: 3,
              text: "What grade are you in?",
              audio: require('@/data/grade_3_english_book_page_19/block_3_audio.mp3'),
            },
            {
              id: 4,
              text: "I'm in grade three.",
              audio: require('@/data/grade_3_english_book_page_19/block_4_audio.mp3'),
            },
            {
              id: 5,
              text: "I'm in grade four.",
              audio: require('@/data/grade_3_english_book_page_19/block_5_audio.mp3'),
            },
            {
              id: 6,
              text: "I'm in grade five.",
              audio: require('@/data/grade_3_english_book_page_19/block_6_audio.mp3'),
            },
            {
              id: 7,
              text: "I'm in grade six.",
              audio: require('@/data/grade_3_english_book_page_19/block_7_audio.mp3'),
            },
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'The Adventures of Little Star',
      author: 'Creative Stories',
      backgroundColor: '#7ED321',
      hasData: false,
    },
    {
      id: 3,
      title: 'Rainbow Friends',
      author: 'Fun Learning',
      backgroundColor: '#F5A623',
      hasData: false,
    },
    {
      id: 4,
      title: 'The Brave Little Mouse',
      author: 'Animal Tales',
      backgroundColor: '#D0021B',
      hasData: false,
    },
  ];
};
