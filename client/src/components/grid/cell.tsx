type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

interface CellProps {
  letter: string;
  status: LetterStatus; 
};

export default function Cell({letter, status}: CellProps){ 
    const bg = status === 'correct' ? '#75A865'
             : status === 'present' ? '#C6B55B'
             : status === 'absent'  ? '#D9D9D9'
             : '#D9D9D9';

    return(
        <div style={{backgroundColor : bg, borderRadius : '6px'}}>
            <div style={{color : 'white', width : '5rem', height : '5rem', fontSize : "2rem", fontWeight : 'bold', alignContent: 'center'}}>{letter.toUpperCase()}</div>
        </div>
    )
}
