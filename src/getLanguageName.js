import ISO6391 from "iso-639-1";
import ISO3166Alpha2 from "iso-3166-1-alpha-2";

const getLanguageName = ({ localeCode }) => {
  const [languageCode, countryCode] = localeCode.split("-");

  const languageName = ISO6391.getName(languageCode);
  const countryName = ISO3166Alpha2.getCountry(countryCode);

  return `${languageName} (${countryName})`;
};

export default getLanguageName;
