import React from 'react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/constants';

export default function WhatsAppButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.502 1.14 6.742 3.068 9.372L1.06 31.44l6.256-2.004c2.508 1.72 5.562 2.724 8.848 2.724C24.82 32.16 32 24.984 32 16.156S24.832 0 16.004 0zm9.51 22.604c-.398 1.122-2.326 2.148-3.244 2.226-.84.074-1.892.106-3.054-.192-.704-.18-1.608-.424-2.766-.832-4.864-1.72-8.034-6.616-8.276-6.924-.242-.308-1.976-2.632-1.976-5.02 0-2.388 1.248-3.564 1.692-4.048.444-.484.968-.606 1.292-.606.324 0 .648.002.932.016.3.016.7-.114 1.096.836.398.954 1.354 3.3 1.474 3.542.12.242.198.524.04.846-.16.322-.242.524-.484.806-.242.282-.508.63-.726.846-.242.242-.494.504-.212.99.282.484 1.254 2.072 2.694 3.356 1.852 1.652 3.416 2.164 3.9 2.406.484.242.766.202 1.048-.122.282-.324 1.212-1.412 1.534-1.896.324-.484.646-.402 1.09-.242.444.16 2.83 1.336 3.314 1.578.484.242.808.364.928.564.12.198.12 1.16-.278 2.282z"/>
      </svg>
    </a>
  );
}