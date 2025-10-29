import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Package, RefreshCw, Phone } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-900/70 backdrop-blur-md py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Інформація</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setDeliveryModalOpen(true)}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Доставка
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setReturnModalOpen(true)}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Обмін та повернення
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Контакти</h3>
              <a
                href="tel:0950388546"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                095 038 85 46
              </a>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Соціальні мережі</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.tiktok.com/@matiiv95?_t=ZM-90vn5xHQJ8l&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/nazar_matiiv_?igsh=MmZyMzNhaGNkYmJ2&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © 2025 Всі права захищені
            </p>
            <Link
              to="/admin/login"
              className="text-[10px] text-slate-600/40 hover:text-slate-500/60 transition-colors"
            >
              •
            </Link>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        title="Доставка"
      >
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">
            Доставка замовлень здійснюється компанією-перевізником <strong>"Нова Пошта"</strong>.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Послуги доставки оплачуються замовником при отриманні. Вартість доставки встановлюється
            згідно з тарифами "Нової пошти"
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Будь ласка, перевіряйте посилку при отриманні у відділенні "Нової пошти". У разі, якщо
            ви помітили пошкодження посилки або недостачу будь-яких позицій, Ви можете відмовитися
            від посилки, склавши Акт з претензією на відділенні в момент отримання посилки.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Ви можете відстежити статус доставки замовлення за допомогою спеціального сервісу
            "Нової пошти" на сайті компанії або в мобільному додатку.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Послуга переадресації посилки з одного відділення "Нової пошти" на інше оплачується
            клієнтом додатково.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Обмін та повернення"
      >
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">
            Згідно із Законом України «Про захист прав споживачів», (
            <a
              href="https://zakon.rada.gov.ua/laws/show/1023-12#Text"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              https://zakon.rada.gov.ua/laws/show/1023-12#Text
            </a>
            ) Ви можете повернути або обміняти новий товар без слідів експлуатації протягом 14 днів
            з моменту купівлі.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-900 font-semibold mb-2">Важливо!</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              Поверненню підлягає товар, який не був у використанні та не втратив товарний вигляд.
              Має бути збережено цілісність упаковки. Не підлягають поверненню жилки, повідковий
              матеріал, шнури.
            </p>
          </div>
          <p className="text-slate-700 leading-relaxed mt-4">
            Ви можете повернути товар протягом 14 днів з моменту купівлі «Новою поштою». При
            поверненні товару вартість відправки оплачує клієнт. Вартість доставки розраховується
            за тарифами перевізника залежно від фактичної/об'ємної ваги та оціночної вартості товару.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Якщо ви отримали не той товар, який замовляли, Ви можете відмовитись від його отримання
            у відділенні поштового зв'язку, ми компенсуємо вартість відправки цього повернення з
            відділення.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Будь ласка, перевіряйте товари при отриманні у відділенні поштового зв'язку або при
            доставці замовлення кур'єром. У разі, якщо Ви помітили пошкодження товару або недостачу
            будь-яких позицій, Ви можете відмовитися від посилки, склавши Акт з претензією на
            відділенні в момент отримання посилки. Заявки щодо обміну товару або компенсації коштів
            не будуть розглянуті, якщо цілісність та комплектність Вашого замовлення не було
            перевірено в момент його отримання.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default Footer;
