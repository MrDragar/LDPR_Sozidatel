import React from 'react';
import { Check } from 'lucide-react';

interface SuccessPageProps {
  surname: string;
  name: string;
  patronymic?: string;
  gender?: string;
  nomination: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ surname, name, patronymic, gender, nomination }) => {
  let greeting = "Уважаемый(ая)";
  if (gender === 'Мужской') {
      greeting = "Уважаемый";
  } else if (gender === 'Женский') {
      greeting = "Уважаемая";
  }

  const fullName = `${surname} ${name}${patronymic ? ' ' + patronymic : ''}`;

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col items-center justify-center bg-white sm:bg-gradient-to-br sm:from-[#11236B] sm:via-[#0d1b54] sm:to-[#081033] sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white p-6 py-12 sm:p-12 sm:rounded-[2rem] sm:shadow-2xl text-center relative flex-1 sm:flex-none flex flex-col justify-center">
        
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Check className="h-12 w-12 text-white stroke-[3]" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-8">
            Заявка успешно<br className="hidden sm:block" /> подтверждена!
        </h1>
        
        <div className="text-left mt-8 w-full max-w-md mx-auto sm:max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
                {greeting} <span className="font-bold text-gray-900">{fullName}</span>, спасибо за участие!
            </p>
            <hr className="my-6 border-slate-200" />
            <div>
                <p className="text-sm text-slate-500 mb-2 uppercase tracking-wider font-semibold">Ваша номинация</p>
                <p className="font-bold text-blue-700 text-xl">{nomination}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;