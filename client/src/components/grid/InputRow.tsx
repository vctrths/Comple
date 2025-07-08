import { useEffect, useState } from "react";
import Cell from "./cell";

interface RowProps {
    guess: string;
}

export default function InputRow(){
    const [letters, setLetters] = useState<string[]>([])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key

            switch (key){
                case 'Backspace':
                    setLetters(prev => prev.slice(0, -1))
                    break;
                default:
                    if (key.length === 1 && /[a-zA-Z]/.test(key)){
                        setLetters(prev => prev.length < 5 ? [...prev, key] : prev)
                    }
                    break;
            }
        }
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const paddedLetters = [...letters, ...Array(5 - letters.length).fill('')];

    return(
        <div style={{display : 'flex', gap : '1rem', marginBottom : '1rem'}}>
            {paddedLetters.map((letter, i) => (
                <Cell key={i} letter={letter} status={undefined}></Cell>
            ))}
        </div>
    )
}