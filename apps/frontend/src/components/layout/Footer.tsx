import React from "react";
import Link from "next/link";
import { Gem, Send, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="contacts" className="border-t border-gold-500/20 bg-noir-950 py-16 text-noir-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/40 bg-gold-950/40 text-gold-400">
                <Gem className="h-5 w-5 text-gold-300" />
              </div>
              <span className="font-serif text-xl font-semibold tracking-wider text-gold-200 uppercase">
                Marziya Gold
              </span>
            </div>
            <p className="text-sm leading-relaxed text-noir-400">
              Авторские ювелирные изделия ручной работы. Каждое изделие создается
              по индивидуальным эскизам с неповторимым вниманием к деталям,
              пробе благородных металлов и чистоте драгоценных камней.
            </p>
          </div>

          {/* Catalog Categories */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold tracking-wider text-gold-300 uppercase">
              Категории изделий
            </h3>
            <ul className="space-y-2 text-sm text-noir-400">
              <li>
                <Link href="/#catalog" className="hover:text-gold-200 transition-colors">
                  Кольца и перстни
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-gold-200 transition-colors">
                  Серьги и подвески
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-gold-200 transition-colors">
                  Колье и ожерелья
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-gold-200 transition-colors">
                  Браслеты ручной работы
                </Link>
              </li>
            </ul>
          </div>

          {/* Master Atelier Contacts */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold tracking-wider text-gold-300 uppercase">
              Мастерская и связь
            </h3>
            <div className="space-y-3 text-sm text-noir-400">
              <div className="flex items-center gap-3">
                <Send className="h-4 w-4 text-gold-400 shrink-0" />
                <a
                  href="https://t.me/marziya_master"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold-200 transition-colors"
                >
                  @marziya_master (Telegram)
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <a
                  href="tel:+998901234567"
                  className="hover:text-gold-200 transition-colors"
                >
                  +998 (90) 123-45-67
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
                <span>г. Ташкент, ул. Заргарлик, Мастерская Marziya Gold</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-noir-800 pt-8 text-center text-xs text-noir-500">
          <p>© {new Date().getFullYear()} Marziya Gold. Все права защищены. Индивидуальный заказ ювелирных изделий.</p>
        </div>
      </div>
    </footer>
  );
};
