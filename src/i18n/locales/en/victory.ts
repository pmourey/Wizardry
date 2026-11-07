import { VictoryTranslations } from '../../types';

export const victoryEn: VictoryTranslations = {
  bannerTitle: "*** CONGRATULATIONS ***",
  bannerSubtitle: "THE QUEST IS COMPLETE · THE MAD OVERLORD REJOICES",
  proclamationAmuletSafe:
    "YOU HAVE COMPLETED YOUR QUEST AND THE AMULET OF WERDNA IS NOW SAFELY BACK IN THE HANDS OF YOUR BENEFICENT RULER, TREBOR.",
  proclamationBoon: (expBonus: number) =>
    `IN RETURN FOR THIS GLORIOUS SERVICE, HE GRANTS YOU A BOON OF +${expBonus.toLocaleString()} EXPERIENCE POINTS EACH!`,
  proclamationGuardHonor:
    "ADDITIONALLY, YOU WILL BE INITIATED INTO THE OVERLORD'S HONOR GUARD AND THUS WILL BE ENTITLED TO WEAR THE > CHEVRON OF THIS RANK EVERMORE.",
  proclamationVaultNote:
    "Trebor securely stores the Amulet in the Royal Citadel Vault, and exceptionally allows your party to keep all personal weapons and equipment!",
  honorGuardRosterTitle: "The Overlord's Honor Guard Roster:",
  expAwardedBadge: (exp: number) => `+${exp.toLocaleString()} EXP`,
  chevronBadge: "HONOR CHEVRON [ > ]",
  celebrateAtCastleBtn: "Return to Castle to Celebrate Victory",
  screenTitle: "*** CONGRATULATIONS ***",
  screenBody:
    "You have vanquished the evil wizard Werdna and returned the sacred Amulet to Overlord Trebor! Each survivor receives 250,000 Experience Points and the supreme Honor Chevron (>) of the royal guard.",
};
