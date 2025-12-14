import NavLink from "../nav-link";

export default function NavMobileMenu({show}:{show: boolean}) {
    return <div className={`fixed z-50 w-full h-full left-0 ${show ? "top-0" : "top-0"}`}>
        <nav className={`w-9/12 h-full overflow-auto pl-4 pr-18 pt-10 pb-20 flex flex-col bg-cyber-dark-400/90 gap-1`}>
            <NavLink href="/">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Dashboard
          </span>
            </NavLink>
            <NavLink href="/stake">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
            </svg>
            Stake
          </span>
            </NavLink>
        </nav>
    </div>
}