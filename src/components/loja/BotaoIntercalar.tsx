'use client';

import { useState } from 'react';

export function BotaoIntercalar() {
  const [isEntrega, setIsEntrega] = useState(true);

  return (
    <div className="relative bg-gray-200 rounded-full p-1" style={{ borderRadius: '100px' }}>
      <div 
        className={`absolute top-1 transition-all duration-300 ease-in-out bg-white rounded-full shadow-md ${
          isEntrega ? 'left-1' : 'left-[calc(100%-85px)]'
        }`}
        style={{ 
          width: '85px', 
          height: 'calc(100% - 8px)',
          borderRadius: '100px'
        }}
      />
      <div className="relative flex">
        <button
          onClick={() => setIsEntrega(true)}
          className={`w-[85px] py-2 text-[11px] font-medium transition-colors duration-300 z-10 flex items-center justify-center gap-1 ${
            isEntrega ? 'text-purple-600' : 'text-gray-500'
          }`}
          style={{ borderRadius: '100px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
            <path d="M120-640v-200h280v200H120Zm80-80h120v-40H200v40Zm80 520q-50 0-85-35t-35-85H80v-120q0-66 47-113t113-47h160v200h140l140-174v-106H560v-80h120q33 0 56.5 23.5T760-680v134L580-320H400q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T320-320h-80q0 17 11.5 28.5T280-280Zm480 80q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T800-320q0-17-11.5-28.5T760-360q-17 0-28.5 11.5T720-320q0 17 11.5 28.5T760-280ZM160-400h160v-120h-80q-33 0-56.5 23.5T160-440v40Zm160-320v-40 40Zm0 320Z"/>
          </svg>
          Entrega
        </button>
        <button
          onClick={() => setIsEntrega(false)}
          className={`w-[85px] py-2 text-[11px] font-medium transition-colors duration-300 z-10 flex items-center justify-center gap-1 ${
            !isEntrega ? 'text-purple-600' : 'text-gray-500'
          }`}
          style={{ borderRadius: '100px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
            <path d="M400-80v-80h520v80H400Zm40-120q0-81 51-141.5T620-416v-25q0-17 11.5-28.5T660-481q17 0 28.5 11.5T700-441v25q77 14 128.5 74.5T880-200H440Zm105-81h228q-19-27-48.5-43.5T660-341q-36 0-66 16.5T545-281Zm114 0ZM40-440v-440h240v58l280-78 320 100v40q0 50-35 85t-85 35h-80v24q0 25-14.5 45.5T628-541L358-440H40Zm80-80h80v-280h-80v280Zm160 0h64l232-85q11-4 17.5-13.5T600-640h-71l-117 38-24-76 125-42h247q9 0 22.5-6.5T796-742l-238-74-278 76v220Z"/>
          </svg>
          Retirada
        </button>
      </div>
    </div>
  );
} 