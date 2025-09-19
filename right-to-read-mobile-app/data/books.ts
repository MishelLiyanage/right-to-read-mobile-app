import { Book } from '@/types/book';

export const getAllBooks = (): Book[] => {
  return [
    {
      id: 1,
      title: 'Grade 3 English Book',
      author: 'Ministry of Education',
      backgroundColor: '#4A90E2',
      hasData: true,
      tableOfContents: [
        {
          id: 'myself',
          title: 'Myself',
          pageNumber: 1
        },
        {
          id: 'my-home',
          title: 'My home',
          pageNumber: 21
        },
        {
          id: 'our-school',
          title: 'Our school',
          pageNumber: 44
        },
        {
          id: 'my-food-bag',
          title: 'My food bag',
          pageNumber: 51
        },
        {
          id: 'animal-friends',
          title: 'Animal friends',
          pageNumber: 67
        },
        {
          id: 'clothes-we-wear',
          title: 'Clothes we wear',
          pageNumber: 85
        },
        {
          id: 'playing-is-fun',
          title: 'Playing is fun',
          pageNumber: 94
        },
        {
          id: 'world-around-me',
          title: 'World around me',
          pageNumber: 111
        }
      ],
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
        },
        {
          pageNumber: 22,
          image: require('@/data/grade_3_english_book_page_22/grade_3_english_book.pdf_page_22.png'),
          blocks: [
            {
              id: 2,
              text: "Sahan, this is my friend, Nizam.",
              audio: require('@/data/grade_3_english_book_page_22/block_22_2_audio.mp3'),
            },
            {
              id: 3,
              text: "Hello! Sahan.",
              audio: require('@/data/grade_3_english_book_page_22/block_22_3_audio.mp3'),
            },
            {
              id: 4,
              text: "Hello! Nizam.",
              audio: require('@/data/grade_3_english_book_page_22/block_22_4_audio.mp3'),
            },
            {
              id: 5,
              text: "Make groups of three. Introduce your friend.",
              audio: require('@/data/grade_3_english_book_page_22/block_22_5_audio.mp3'),
            },
          ]
        },
        {
          pageNumber: 44,
          image: require('@/data/grade_3_english_book_page_44/grade_3_english_book.pdf_page_44.png'),
          blocks: [
            {
              id: 2,
              text: "Hi, I'm Raveen. This is my school.",
              audio: require('@/data/grade_3_english_book_page_44/block_44_2_audio.mp3'),
            },
            {
              id: 3,
              text: "Listen and say.",
              audio: require('@/data/grade_3_english_book_page_44/block_44_3_audio.mp3'),
            },
            {
              id: 4,
              text: "Our school 3",
              audio: require('@/data/grade_3_english_book_page_44/block_44_4_audio.mp3'),
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
