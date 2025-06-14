export function Admin() {
  return (
    <div id="body" className="bg-slate-50 h-screen flex">
      <nav className="bg-white w-80 h-screen flex flex-col gap-10 border-r border-slate-100">
        <div className="logo text-2xl font-bold text-center h-16 flex items-center justify-center">
          Greeny
        </div>
        <div className="user flex items-center justify-center flex-col gap-4 border-b border-emerald-slate-50 py-4">
          <img
            className="w-24 rounded-full shadow-xl"
            src="https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes-thumbnail.png"
          />
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg text-emerald-700">
              Muhammed YEŞİLMEN
            </span>
            <span className="text-slate-400 text-sm">Developer</span>
          </div>
          <div className="text-sm text-slate-400">
            <span className="font-semibold text-slate-500">
              Yönlendirilmiş Ticket Sayısı
            </span>{" "}
            (20)
          </div>
        </div>

        <ul className="px-6 space-y-2">
          <li>
            <a
              className="block px-4 py-2.5 text-slate-800 font-semibold  hover:bg-emerald-950 hover:text-white rounded-lg"
              href="#"
            >
              Haber Yönetimi
            </a>
          </li>
          <li>
            <a
              className="block px-4 py-2.5 text-slate-800 font-semibold hover:bg-emerald-950 hover:text-white rounded-lg"
              href="#"
            >
              CMS Hesapları
            </a>
          </li>
          <li>
            <a
              className="block px-4 py-2.5 text-slate-800 font-semibold hover:bg-emerald-950 hover:text-white rounded-lg"
              href="#"
            >
              Destek Talepleri
            </a>
          </li>
          <li className="bg-slate-50 pb-2 rounded-lg border">
            <a
              className="block px-4 py-2.5 text-slate-200 font-semibold hover:bg-emerald-950 hover:text-white rounded-lg bg-emerald-950"
              href="#"
            >
              Loglar & Kayıtlar
            </a>
            <ol className="text-sm text-slate-700 space-y-4 pl-6 my-2.5">
              <li>
                <a className="block text-slate-500 hover:text-slate-950">
                  Karakter Transfer Talepleri
                </a>
              </li>
              <li>
                <a className="block text-slate-500 hover:text-slate-950">
                  Silah Yükseltme Talepleri
                </a>
              </li>
              <li>
                <a className="block text-slate-500 hover:text-slate-950">
                  İsim Değiştirme Kayıtları
                </a>
              </li>
              <li>
                <a className="block text-slate-500 hover:text-slate-950">
                  Klan Değiştirme Kayıtları
                </a>
              </li>
            </ol>
          </li>
          <li>
            <a
              className="block px-4 py-2.5 text-slate-800 font-semibold hover:bg-emerald-950 hover:text-white rounded-lg"
              href="#"
            >
              Etkinlik Yönetimi
            </a>
          </li>
        </ul>
      </nav>
      <div className="right w-full flex gap-2 flex-col">
        <header className="h-16 w-full flex items-center p-4 text-slate-400">
          <ol className=" text-slate-400 flex flex-wrap gap-1 text-sm [&>li:last-child]:font-semibold [&>li:not(:first-child)]:before:content-['\00bb']">
            <li className="before:content-['\2616'] before:mx-2">
              <a href="#">Homepage</a>
            </li>
            <li className="before:mx-2">
              <a href="#">Category Name</a>
            </li>
            <li className="before:mx-2">Page name</li>
          </ol>
        </header>

        <div className="p-4">
          <h1 className="text-xl font-semibold text-slate-500 page-title">
            Page Name
          </h1>
        </div>
      </div>
    </div>
  );
}
