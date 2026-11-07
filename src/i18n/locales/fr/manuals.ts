import { ManualsTranslations } from '../../types';

export const manualsFr: ManualsTranslations = {
  modalTitle: 'Bibliothèque des Manuels & Parchemins Officiels',
  searchPlaceholder: 'Rechercher par titre, auteur, année, mot-clé...',
  categoryAll: 'Tous les Documents',
  categoryOfficial: 'Manuels Officiels',
  categoryFanScenario: 'Scénarios & Guides de Fans',
  categoryGrimoire: 'Grimoires de Sorts',
  categoryModding: 'Outils & Documentation Modding',
  filterLangAll: 'Toutes les Langues',
  filterLangFr: 'Français uniquement',
  filterLangEn: 'Anglais uniquement',
  pagesCount: (pages: number) => `${pages} page${pages > 1 ? 's' : ''}`,
  openPdfBtn: 'Consulter le Document PDF',
  externalArchiveBtn: 'Miroir Internet Archive',
  noResults: 'Aucun document ne correspond à vos critères de recherche.'
};
