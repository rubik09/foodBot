import { Menu } from 'src/schemas/menu.schema';

export async function printMenuForDay(dayMenu: any) {
  const result = [];
  for (const day of dayMenu) {
    const formattedDay = Object.entries(day)
      .map(([key, value]) => {
        if (value !== '') {
          return `${key}: ${value}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
    result.push(formattedDay);
  }
  return result.join('\n\n');
}

export async function formatMenu(menuData: Menu[]) {
  const mapa = {
    weekDay: 'День недели',
    soup: 'Суп',
    hotDish1: 'Горячее 1',
    hotDish2: 'Горячее 2',
    hotDish3: 'Горячее 3',
    salad: 'Салат',
  };
  const formattedMenu = menuData.map((item) => ({
    [mapa.weekDay]: item['weekDay'],
    [mapa.soup]: item['soup'],
    [mapa.hotDish1]: item['hotDish1'],
    [mapa.hotDish2]: item['hotDish2'],
    [mapa.hotDish3]: item['hotDish3'],
    [mapa.salad]: item['salad'],
  }));

  return formattedMenu;
}
