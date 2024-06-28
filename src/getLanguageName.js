import ISO6391 from "iso-639-1";
import ISO3166Alpha2 from "iso-3166-1-alpha-2";

const getLanguageName = ({ localeCode }) => {
  if (!localeCode) {
    throw new Error("Locale code is required");
  }

  const [languageCode, countryCode] = localeCode.split("-");

  if (!languageCode) {
    throw new Error(
      "Invalid locale code format. Expected format: languageCode-countryCode"
    );
  }

  const languageName = ISO6391.getName(languageCode);
  const countryName = ISO3166Alpha2.getCountry(countryCode);

  if (!languageName) {
    throw new Error("Invalid language code");
  }

  if (!countryName) {
    return languageName;
  }

  return `${languageName} (${countryName})`;
};

export default getLanguageName;
