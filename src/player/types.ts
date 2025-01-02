type CountryStats = {
  wins: number;
  matches: number;
};

type CountryRatios = {
  [key: string]: CountryStats;
};
