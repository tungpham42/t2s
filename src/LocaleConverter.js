import React from "react";
import ISO6391 from "iso-639-1";
import ISO3166Alpha2 from "iso-3166-1-alpha-2";

const LocaleConverter = ({ localeCode }) => {
  // Split the locale code into language and country parts
  const [languageCode, countryCode] = localeCode.split("-");

  // Function to get language name from ISO 639-1 language code
  const getLanguageName = (code) => ISO6391.getName(code);

  // Function to get country name from ISO 3166-1 alpha-2 country code
  const getCountryName = (code) => ISO3166Alpha2.getCountry(code);

  // Get language name
  const languageName = getLanguageName(languageCode);

  // Get country name only if countryCode is defined
  const countryName = getCountryName(countryCode)
    ? `(${getCountryName(countryCode)})`
    : "";

  return (
    <>
      {languageName} {countryName}
    </>
  );
};

export default LocaleConverter;
