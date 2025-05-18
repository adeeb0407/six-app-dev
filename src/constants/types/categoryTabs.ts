export enum CategoryTabs {
  General = 'General',
  Meet = 'Meet',
  Chat = 'Chat',
}


export const categoryTabColors: Record<CategoryTabs, { bg: string; }> = {
  [CategoryTabs.General]: { bg: '#dbfae6', },
  [CategoryTabs.Meet]: { bg: '#dbeafe', },
  [CategoryTabs.Chat]: { bg: '#f3f4f6', },
};
