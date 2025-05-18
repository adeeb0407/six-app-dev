export enum CategoryTabs {
  General = 'General',
  Hangout = 'Hangout',
  Opportunity = 'Opportunity',
  Help = 'Help',
  Chat = 'Chat',
}


export const categoryTabColors: Record<CategoryTabs, { bg: string; }> = {
  [CategoryTabs.General]: { bg: '#dbfae6', },
  [CategoryTabs.Hangout]: { bg: '#dbeafe', },
  [CategoryTabs.Opportunity]: { bg: '#fbe7f3', },
  [CategoryTabs.Help]: { bg: '#fef7c3', },
  [CategoryTabs.Chat]: { bg: '#f3f4f6', },
};
