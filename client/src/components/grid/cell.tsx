type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

interface CellProps {
  letter: string;
  status: LetterStatus; 
};

export default function Cell({letter, status}: CellProps){ 
    const bg = status === 'correct' ? '#75A865'
             : status === 'present' ? '#C6B55B'
             : status === 'absent'  ? '#D9D9D9'
             : '';



    const border = status === undefined ? (letter === '' ? 'inset 0 0 0 4px #D9D9D9' : 'inset 0 0 0 4px #292929') : 'none';
    const textColor = status === undefined ? '#292929' : 'white';

    return(
        <div style={{backgroundColor : bg, borderRadius : '6px', boxShadow : border}}>
            <div style={{color : textColor, width : '5rem', height : '5rem', fontSize : "2rem", fontWeight : 'bold', alignContent: 'center'}}>{letter.toUpperCase()}</div>
        </div>
    )
}
