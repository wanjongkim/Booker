import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function IndexPage() {
    const [places, setPlaces] = useState([]);
    useEffect(() => {
        axios.get('/places').then((response) => {
            setPlaces(response.data);
        })
    }, [])
    return (
        <div className="gap-x-6 gap-y-8 mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {places.length > 0 && places.map((place, index) => (
                <Link to={'/place/' + place._id} key={index}>
                    <div className="bg-gray-500 mb-2 rounded-2xl flex">
                        {place.photos?.[index] && (
                            <img className="rounded-2xl object-cover aspect-square" src={place.photos?.[index]} alt="user uploaded images" />
                        )}
                    </div>
                    <h3 className="font-bold">{place.address}</h3>
                    <h2 className="text-sm text-gray-500">{place.title}</h2>
                    
                    <div className="mt-1">
                        <span className="font-bold">${place.price} per night</span>
                        
                    </div>
                </Link>
            ))}
        </div>
    );
}    
