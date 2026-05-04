export const products = [
  {
    id: 1,
      title: 'NFC Наклейка',
      // Основная цена для отображения в каталоге
    price: 85, 
    // Значение по умолчанию для бейджа на главной
    chip: 'NTAG213',
      image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=300',
      options: [
        { chip: 'NTAG213', price: 85 },
        { chip: 'NTAG216', price: 160 },
        { chip: 'NTAG424 DNA', price: 210 },
      ],
      description: 'Для візиток, посилань та дому.',
  },
  {
    id: 2,
      title: 'NFC Карта',
      chip: 'NTAG216',
      price: 250,
      image: 'https://images.unsplash.com/photo-1625217527288-93919c99650a?w=300',
      options: [
      { chip: 'NTAG216', price: 250 },
      { chip: 'NTAG424 DNA', price: 320 },
    ],
    description: 'Для бізнес-візиток та доступу.',
  },
];
