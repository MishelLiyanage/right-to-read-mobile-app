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
              text: "Grade 3",
              audio: require('@/data/grade_3_english_book_page_19/block_3_audio.mp3'),
            },
            {
              id: 4,
              text: "Grade 4",
              audio: require('@/data/grade_3_english_book_page_19/block_4_audio.mp3'),
            },
            {
              id: 5,
              text: "Grade 5",
              audio: require('@/data/grade_3_english_book_page_19/block_5_audio.mp3'),
            },
            {
              id: 6,
              text: "Grade 6",
              audio: require('@/data/grade_3_english_book_page_19/block_6_audio.mp3'),
            },
            {
              id: 7,
              text: "I'm in grade f ive.",
              audio: require('@/data/grade_3_english_book_page_19/block_7_audio.mp3'),
            },
            {
              id: 8,
              text: "I'm in grade six.",
              audio: require('@/data/grade_3_english_book_page_19/block_8_audio.mp3'),
            },
            {
              id: 9,
              text: "I'm in grade three. I'm in grade four.",
              audio: require('@/data/grade_3_english_book_page_19/block_9_audio.mp3'),
            },
            {
              id: 10,
              text: "What grade are you in?",
              audio: require('@/data/grade_3_english_book_page_19/block_10_audio.mp3'),
            },
          ]
        },
        {
          pageNumber: 20,
          image: require('@/data/grade_3_english_book_page_20/grade_3_english_book.pdf_page_20.png'),
          blocks: [
            {
              id: 1,
              text: "Listen and say.",
              audio: require('@/data/grade_3_english_book_page_20/block_20_1_audio.mp3'),
            },
            {
              id: 2,
              text: "Where do you live?",
              audio: require('@/data/grade_3_english_book_page_20/block_20_2_audio.mp3'),
            },
            {
              id: 3,
              text: "I live in ...........",
              audio: require('@/data/grade_3_english_book_page_20/block_20_3_audio.mp3'),
            },
            {
              id: 4,
              text: "I live in ........ I live in.......",
              audio: require('@/data/grade_3_english_book_page_20/block_20_4_audio.mp3'),
            },
            {
              id: 5,
              text: "I live in Matara.",
              audio: require('@/data/grade_3_english_book_page_20/block_20_5_audio.mp3'),
            },
          ]
        },
        {
          pageNumber: 21,
          image: require('@/data/grade_3_english_book_page_21/grade_3_english_book.pdf_page_21.png'),
          blocks: [
            {
              id: 2,
              text: "12",
              audio: require('@/data/grade_3_english_book_page_21/block_21_2_audio.mp3'),
            },
            {
              id: 3,
              text: "Play the game. Listen and practise.",
              audio: require('@/data/grade_3_english_book_page_21/block_21_3_audio.mp3'),
            },
            {
              id: 4,
              text: "Stand in a circle. Ask a friend to stand in the middle. Pass the ball. Practise. \"Where do you live?\" \"I live in ............................",
              audio: require('@/data/grade_3_english_book_page_21/block_21_4_audio.mp3'),
            },
            {
              id: 5,
              text: "Say.",
              audio: require('@/data/grade_3_english_book_page_21/block_21_5_audio.mp3'),
            },
            {
              id: 6,
              text: "Meenu, this is my friend, Rasini.",
              audio: require('@/data/grade_3_english_book_page_21/block_21_6_audio.mp3'),
            },
            {
              id: 7,
              text: "Hello! Rasini.",
              audio: require('@/data/grade_3_english_book_page_21/block_21_7_audio.mp3'),
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
    {
      id: 5,
      title: 'The Adventures of Little Star',
      author: 'Creative Stories',
      backgroundColor: '#7ED321',
      hasData: false,
    },
    {
      id: 6,
      title: 'Rainbow Friends',
      author: 'Fun Learning',
      backgroundColor: '#F5A623',
      hasData: false,
    },
    {
      id: 7,
      title: 'The Brave Little Mouse',
      author: 'Animal Tales',
      backgroundColor: '#D0021B',
      hasData: false,
    },
  ];
};
