import axios from 'axios';

export const getCookie = (name) => {
    let cookies, c;
    cookies = document.cookie.split(';');
    for (var i=0; i < cookies.length; i++) {
        c = cookies[i].split('=');
        if (c[0] == name) {
            return c[1];
        }
    }
    return "";
}

export const setCookie = (name, value, exdays) => {
    var d, expires;
    exdays = exdays || 1;
    d = new Date();
    d.setTime(d.getTime() + (exdays2460601000));
    expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + "; " + expires;
}

export const isTokenSet = () => {
    if(document.cookie.includes("dexitoken=")) {
        return true;
    }
}

export const logout = () => {
       axios.post(process.env.API + '/dj-rest-auth/logout/')
        .then((response) => {
            console.log(response);
            document.cookie = "dexitoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/";
        })
}

export const readSearchParams = () => {
    let usp = new URLSearchParams(window.location.search);
    let params = {};
    usp.forEach((value, key) => {
      if (!params[key]) {
        params[key] = [];
      }
      params[key].push(value);
    });
    return params;
  }

export const schemasLookup = () => {

    return {
        "PERSON": "A person (alive, dead, undead, or fictional)",
        "ORG": "An organization e.g., a school, NGO, corporation, club, etc.",
        "GPE": "Countries, cities, states",
        "LOC": "Non-GPE locations, mountain ranges, bodies of water",
        "PRODUCT": "Objects, vehicles, foods, etc. (Not services)",
        "EVENT": "Named hurricanes, battles, wars, sports events, etc.",
        "WORK_OF_ART": "Titles of books, songs, etc.",
        "LAW": "Named documents made into laws.",
        "LANGUAGE": "Any named language",
        "DATE": "Absolute or relative dates or periods",
        "TIME": "Times smaller than a day",
        "PERCENT": "Percentage, including ”%“",
        "MONEY": "Monetary values, including unit",
        "QUANTITY": "Measurements, as of weight or distance",
        "ORDINAL": "“first”, “second”, etc.",
        "CARDINAL": "Numerals that do not fall under another type",
        "FAC": "Buildings, airports, highways, bridges, etc.",
        "NORP": "Nationalities or religious or political groups."
    }


}