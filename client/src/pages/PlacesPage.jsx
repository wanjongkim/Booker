import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import axios from "axios"
import PlaceImg from "../PlaceImg";

const PlacesPage = () => {
    const [places, setPlaces] = useState([])
    const MAX_LENGTH_CHARACTERS = 500;

    useEffect(() => {
        axios.get('/user-places').then(({data}) => {
            setPlaces(data);
        });
    }, [])
    return (
        <div>
            <AccountNav />
            <div className="text-center">
                <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add new place    
                </Link>
            </div>
            <div className="mt-4">
                {places.length > 0 && places.map((place, index) => (
                    <Link to={'/account/places/'+place._id} className="flex flex-col md:flex-row cursor-pointer gap-4 mb-3 bg-gray-100 p-4 rounded-2xl" key={index}>
                        <div className="flex mx-auto w-32 h-32 bg-gray-300 gro shrink-0">
                            <PlaceImg src={place} />
                        </div>
                        <div className="grow-0 shrink">
                            <h2 className="text-xl">{place.title}</h2>
                            <pre className="font-sans text-sm mt-2 break-words" >{`${place.description.substring(0, MAX_LENGTH_CHARACTERS)}`} {place.description.length > MAX_LENGTH_CHARACTERS ? 
                            <button className="font-semibold"><br />Show more &#8594;</button> : null}</pre>
                        </div>
                    </Link>
                ))}
            </div>
        </div>    
    )
}

export default PlacesPage;