import Script from "next/script";

const INIT = `(function(){try{var t=localStorage.getItem('gatumis-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');else document.documentElement.setAttribute('data-theme','dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})()`;

export function ThemeInitScript() {
  return (
    <Script id="gatumis-theme-init" strategy="beforeInteractive">
      {INIT}
    </Script>
  );
}
