

import React, {useState} from 'react';

const Counter = () =>{

    const [Count, setCount] = useState(0);

    const increment = ()=>{
        setCount(Count +2);
    }

    const decrement = () =>{
        if(Count>0)
        setCount(Count - 2);
    }
    return (
        <div>
            <p>{Count}</p>
            <button onClick = {increment}> +</button>
            <button onClick = {decrement}>-</button>
        </div>
    );
}


export default Counter;