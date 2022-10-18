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