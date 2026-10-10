export type LanguageCode = 'en' | 'es' | 'fr' | 'pt' | 'de';

export interface TranslationStrings {
  title: string;
  tagline: string;
  supportDev: string;
  themeToggle: string;
  teamA: string;
  teamB: string;
  period: string;
  set: string;
  quarter: string;
  half: string;
  final: string;
  reset: string;
  swap: string;
  copyLink: string;
  linkCopied: string;
  settings: string;
  obsMode: string;
  exitObs: string;
  savedBoards: string;
  saveCurrent: string;
  customColors: string;
  uploadLogo: string;
  removeLogo: string;
  customCss: string;
  instructionsTap: string;
}

export const translations: Record<LanguageCode, TranslationStrings> = {
  en: {
    title: 'MatchBoard',
    tagline: 'Premium Zero-Server Live Scoreboard',
    supportDev: 'Support the Developer',
    themeToggle: 'Toggle Theme',
    teamA: 'Team A',
    teamB: 'Team B',
    period: 'Period',
    set: 'Set',
    quarter: 'Quarter',
    half: 'Half',
    final: 'Final',
    reset: 'Reset Scores',
    swap: 'Swap Sides',
    copyLink: 'Copy Live Link',
    linkCopied: 'Live Link Copied!',
    settings: 'Board Settings',
    obsMode: 'OBS Broadcast Mode',
    exitObs: 'Exit Broadcast Mode',
    savedBoards: 'Saved Boards',
    saveCurrent: 'Save Current Board',
    customColors: 'Custom Team Colors',
    uploadLogo: 'Upload Team Logo',
    removeLogo: 'Remove Logo',
    customCss: 'Custom CSS Overrides',
    instructionsTap: 'Tap top 50% to +1, bottom 50% to -1',
  },
  es: {
    title: 'MatchBoard',
    tagline: 'Marcador en Vivo Premium sin Servidor',
    supportDev: 'Apoyar al Desarrollador',
    themeToggle: 'Cambiar Tema',
    teamA: 'Equipo A',
    teamB: 'Equipo B',
    period: 'Período',
    set: 'Set',
    quarter: 'Cuarto',
    half: 'Tiempo',
    final: 'Final',
    reset: 'Reiniciar Marcador',
    swap: 'Cambiar Lados',
    copyLink: 'Copiar Enlace en Vivo',
    linkCopied: '¡Enlace en Vivo Copiado!',
    settings: 'Ajustes del Marcador',
    obsMode: 'Modo de Transmisión OBS',
    exitObs: 'Salir de Transmisión',
    savedBoards: 'Marcadores Guardados',
    saveCurrent: 'Guardar Marcador Actual',
    customColors: 'Colores Personalizados',
    uploadLogo: 'Subir Logo del Equipo',
    removeLogo: 'Eliminar Logo',
    customCss: 'CSS Personalizado',
    instructionsTap: 'Toca arriba para +1, abajo para -1',
  },
  fr: {
    title: 'MatchBoard',
    tagline: 'Tableau de Score en Direct Zéro-Serveur',
    supportDev: 'Soutenir le Développeur',
    themeToggle: 'Changer de Thème',
    teamA: 'Équipe A',
    teamB: 'Équipe B',
    period: 'Période',
    set: 'Set',
    quarter: 'Quart-temps',
    half: 'Mi-temps',
    final: 'Terminé',
    reset: 'Réinitialiser le Score',
    swap: 'Inverser les Côtés',
    copyLink: 'Copier le Lien en Direct',
    linkCopied: 'Lien en Direct Copié !',
    settings: 'Paramètres du Tableau',
    obsMode: 'Mode Diffusion OBS',
    exitObs: 'Quitter le Mode OBS',
    savedBoards: 'Tableaux Enregistrés',
    saveCurrent: 'Enregistrer le Tableau',
    customColors: 'Couleurs d’Équipe',
    uploadLogo: 'Téléverser le Logo',
    removeLogo: 'Supprimer le Logo',
    customCss: 'CSS Personnalisé',
    instructionsTap: 'Appuyez en haut pour +1, en bas pour -1',
  },
  pt: {
    title: 'MatchBoard',
    tagline: 'Placar ao Vivo Premium Zero-Servidor',
    supportDev: 'Apoiar o Desenvolvedor',
    themeToggle: 'Alternar Tema',
    teamA: 'Equipe A',
    teamB: 'Equipe B',
    period: 'Período',
    set: 'Set',
    quarter: 'Quarto',
    half: 'Tempo',
    final: 'Final',
    reset: 'Zerar Placar',
    swap: 'Inverter Lados',
    copyLink: 'Copiar Link ao Vivo',
    linkCopied: 'Link ao Vivo Copiado!',
    settings: 'Configurações do Placar',
    obsMode: 'Modo de Transmissão OBS',
    exitObs: 'Sair da Transmissão',
    savedBoards: 'Placares Salvos',
    saveCurrent: 'Salvar Placar Atual',
    customColors: 'Cores Personalizadas',
    uploadLogo: 'Carregar Logo',
    removeLogo: 'Remover Logo',
    customCss: 'CSS Personalizado',
    instructionsTap: 'Toque em cima para +1, embaixo para -1',
  },
  de: {
    title: 'MatchBoard',
    tagline: 'Premium Live-Anzeigetafel ohne Server',
    supportDev: 'Entwickler unterstützen',
    themeToggle: 'Design wechseln',
    teamA: 'Team A',
    teamB: 'Team B',
    period: 'Periode',
    set: 'Satz',
    quarter: 'Viertel',
    half: 'Halbzeit',
    final: 'Endstand',
    reset: 'Spielstand zurücksetzen',
    swap: 'Seiten tauschen',
    copyLink: 'Live-Link kopieren',
    linkCopied: 'Live-Link kopiert!',
    settings: 'Einstellungen',
    obsMode: 'OBS-Übertragungsmodus',
    exitObs: 'Übertragungsmodus beenden',
    savedBoards: 'Gespeicherte Spiele',
    saveCurrent: 'Aktuelles Spiel speichern',
    customColors: 'Eigene Teamfarben',
    uploadLogo: 'Team-Logo hochladen',
    removeLogo: 'Logo entfernen',
    customCss: 'Benutzerdefiniertes CSS',
    instructionsTap: 'Oben tippen für +1, unten für -1',
  },
};

export const languageNames: Record<LanguageCode, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇬🇧' },
  es: { label: 'Español', flag: '🇪🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
  pt: { label: 'Português', flag: '🇵🇹' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
};
