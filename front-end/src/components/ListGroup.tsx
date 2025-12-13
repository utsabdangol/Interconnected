import { useState } from 'react';
interface Props {
    items: string[];
    heading?: string;
    onSelectItem: (item: string) => void;
}
function ListGroup({ items, heading, onSelectItem }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const logic = () => {
        if (items.length === 0) return <p>There are no items in the list</p>
    }
    return (<>
        <h1>{heading}</h1>
        {logic()}
        <ul>
            {items.map((item, index) => (
                <li
                    style={{
                        padding: "10px",
                        border: "1px solid gray",
                        backgroundColor: selectedIndex === index ? "blue" : "white",
                        color: selectedIndex === index ? "white" : "black",
                        cursor: "pointer"
                    }}
                    key={item}
                    onClick={() => {
                        setSelectedIndex(index)
                        onSelectItem(item);
                    }}
                >
                    {item}
                </li>))}
        </ul>
    </>
    )
}

export default ListGroup;