import Link from "next/link"
import { Phone, Mail, MapPin, Send, Briefcase, ArrowRight, CreditCard, Smartphone } from "lucide-react"

const footerLinks = {
  "О платформе": [
    "О нас",
    "Как это работает",
    "Пресс-центр",
    "Карьера",
    "Блог",
    "Партнёрская программа",
  ],
  "Для заказчиков": [
    "Разместить заказ",
    "Как найти исполнителя",
    "Гарантии и безопасность",
    "Способы оплаты",
    "Урегулирование споров",
    "FAQ для заказчиков",
  ],
  "Для исполнителей": [
    "Зарегистрироваться",
    "Тарифы и комиссии",
    "Продвижение профиля",
    "Правила работы",
    "FAQ для исполнителей",
    "Поддержка",
  ],
  "Категории услуг": [
    "ИТ и разработка",
    "Маркетинг и реклама",
    "Юридические услуги",
    "Финансы и аудит",
    "Логистика и склад",
    "Строительство",
  ],
}

const cities = [
  "Москва", "Санкт-Петербург", "Казань", "Екатеринбург",
  "Новосибирск", "Краснодар", "Нижний Новгород", "Ростов-на-Дону",
  "Уфа", "Самара", "Красноярск", "Воронеж",
]

const payments = ["Visa", "МИР", "MC", "СБП", "ЮMoney"]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "oklch(0.13 0.02 255)" }} className="text-white">
      {/* Newsletter strip */}
      <div className="bg-primary">
        <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-sm">Подпишитесь на новые заказы в вашей категории</p>
            <p className="text-white/75 text-xs mt-0.5">Получайте уведомления о подходящих проектах первыми</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 sm:w-64 px-4 py-2.5 text-sm rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/55 outline-none focus:bg-white/30 transition-colors"
            />
            <button
              style={{ backgroundColor: "oklch(0.22 0.055 255)" }}
              className="hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity flex items-center gap-2 whitespace-nowrap"
            >
              <Send size={14} />
              Подписаться
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Briefcase size={17} className="text-white" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-black text-primary">Бизнес</span>
                <span className="text-xl font-black text-white">Маркет</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-[260px]">
              Крупнейшая российская B2B платформа для поиска и заказа профессиональных бизнес-услуг
            </p>
            <div className="space-y-3">
              <a href="tel:88005553535" className="flex items-center gap-3 text-sm text-white/60 hover:text-primary transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <Phone size={13} />
                </div>
                8 800 555-35-35 (бесплатно)
              </a>
              <a href="mailto:info@biznesmarket.ru" className="flex items-center gap-3 text-sm text-white/60 hover:text-primary transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <Mail size={13} />
                </div>
                info@biznesmarket.ru
              </a>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={13} />
                </div>
                <span>125009, Москва,<br />ул. Тверская, 22</span>
              </div>
            </div>

            {/* App badges */}
            <div className="flex gap-2 mt-6">
              <button className="flex items-center gap-2 border border-white/15 rounded-xl px-3 py-2 hover:border-primary/50 transition-colors group">
                <Smartphone size={16} className="text-white/50 group-hover:text-primary transition-colors" />
                <div>
                  <div className="text-[9px] text-white/40 leading-none">Загрузить в</div>
                  <div className="text-xs font-bold text-white/80 leading-tight mt-0.5">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 border border-white/15 rounded-xl px-3 py-2 hover:border-primary/50 transition-colors group">
                <Smartphone size={16} className="text-white/50 group-hover:text-primary transition-colors" />
                <div>
                  <div className="text-[9px] text-white/40 leading-none">Доступно в</div>
                  <div className="text-xs font-bold text-white/80 leading-tight mt-0.5">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-bold text-white mb-4">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/50 hover:text-primary transition-colors flex items-center gap-1 group"
                    >
                      <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 text-primary -ml-3 group-hover:ml-0 transition-all" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cities */}
        <div className="mt-10 pt-8 border-t border-white/8">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wide mb-3">Услуги в городах России:</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {cities.map((city) => (
              <Link key={city} href="#" className="text-sm text-white/40 hover:text-primary transition-colors">
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-xs text-white/30">
            © 2024 БизнесМаркет. Все права защищены. ООО «БизнесМаркет», ИНН 7701234567
          </div>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link href="#" className="text-xs text-white/35 hover:text-primary transition-colors">Пользовательское соглашение</Link>
            <Link href="#" className="text-xs text-white/35 hover:text-primary transition-colors">Конфиденциальность</Link>
            <Link href="#" className="text-xs text-white/35 hover:text-primary transition-colors">Оферта</Link>
          </div>
          {/* Payment icons */}
          <div className="flex items-center gap-2">
            <CreditCard size={13} className="text-white/30" />
            {payments.map((pay) => (
              <div key={pay} className="border border-white/15 rounded-lg px-2.5 py-1 text-[10px] text-white/45 font-bold hover:border-primary/40 hover:text-primary/70 transition-colors cursor-pointer">
                {pay}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
