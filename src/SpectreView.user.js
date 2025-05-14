// ==UserScript==
// @name         Privacy Redirect Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show a button to open posts in privacy-friendly frontends for X, Quora, and Medium.
// @author       You
// @match        *://x.com/*
// @match        *://www.x.com/*
// @match        *://quora.com/*
// @match        *://www.quora.com/*
// @match        *://medium.com/*
// @match        *://osintteam.blog/*
// @match        *://www.medium.com/*
// @match        *://www.instagram.com/*
// @match        *://instagram.com/*
// @match        *://reddit.com/*
// @match        *://old.reddit.com/*
// @match        *://www.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
   //the fsdfklsjdflk
    const host = window.location.hostname;
    const path = window.location.pathname + window.location.search + window.location.hash;

    let redirectUrl = null;

    if (host.includes("x.com")) {
        redirectUrl = "https://nitter.net" + path;
        window.location.replace(redirectUrl);
        return;
    } else if (host.includes("quora.com")) {
        redirectUrl = "https://quetre.private.coffee" + path;
    } else if (host.includes("medium.com")) {
        redirectUrl = "https://archive.is/" + host + path;
    } else if (host.includes("osintteam.blog")) {
        redirectUrl = "https://archive.is/" + host + path;
    }else if (host.includes("instagram.com")) {
        redirectUrl = "https://imginn.com" + path;
        window.location.replace(redirectUrl);
        return;
    }else if (host.includes("reddit.com")) {
        redirectUrl = "https://reddit.idevicehacked.com" + path;
        window.location.replace(redirectUrl);
        return;
    }

    if (!redirectUrl) return; // Do nothing if the domain is not in the list

    // Create the floating button
    const button = document.createElement("div");
    button.textContent = "🚀 Open in Privacy Frontend";
    button.style.position = "fixed";
    button.style.top = "20px";
    button.style.right = "20px";
    button.style.padding = "10px 20px";
    button.style.backgroundColor = "#1e88e5";
    button.style.color = "white";
    button.style.borderRadius = "8px";
    button.style.fontSize = "14px";
    button.style.fontWeight = "bold";
    button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    button.style.cursor = "pointer";
    button.style.zIndex = "9999";
    button.style.animation = "floatFade 2s ease-in-out infinite alternate";

    // Animation style
    const style = document.createElement("style");
    style.textContent = `
        @keyframes floatFade {
            0% {
                transform: translateY(0);
                opacity: 1;
            }
            100% {
                transform: translateY(6px);
                opacity: 0.9;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(button);

    // Redirect when button is clicked
    button.addEventListener("click", () => {
        window.location.replace(redirectUrl);
    });
})();