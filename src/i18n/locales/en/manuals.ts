import { ManualsTranslations } from '../../types';

export const manualsEn: ManualsTranslations = {
  modalTitle: 'Official Manuals & Parchments Archive',
  searchPlaceholder: 'Search by title, author, year, keywords...',
  categoryAll: 'All Documents',
  categoryOfficial: 'Official Manuals',
  categoryFanScenario: 'Fan Scenarios & Guides',
  categoryGrimoire: 'Spells & Grimoires',
  categoryModding: 'Tools & Modding Specs',
  filterLangAll: 'All Languages',
  filterLangFr: 'French Only',
  filterLangEn: 'English Only',
  pagesCount: (pages: number) => `${pages} page${pages > 1 ? 's' : ''}`,
  openPdfBtn: 'Read PDF Document',
  externalArchiveBtn: 'Internet Archive Mirror',
  noResults: 'No documents match your search criteria.'
};
