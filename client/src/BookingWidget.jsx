import axios from 'axios';
import {differenceInCalendarDays} from 'date-fns' 
import { useEffect } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

export default function BookingWidget({place}) {

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [redirect, setRedirect] = useState('')
    const {user} = useContext(UserContext)

    useEffect(() => {
        if(user) {
            setName(user.name);
        }
    }, [user])

    let numberOfNights = 0;
    if(checkIn && checkOut) {
        numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
    }

    const bookPlace = async () => {
        const data = {checkIn, checkOut, numberOfGuests, name, phone:mobile, 
        place: place._id, price: numberOfNights * place.price}
        const response = await axios.post('/bookings', data)
        const bookingId = response.data._id;
        setRedirect(`/account/bookings/${bookingId}`);
    }

    if(redirect) {
        return <Navigate to={redirect} />
    }

    return (
        <div className="bg-white shadow p-4 rounded-2xl">
            <div className="text-2xl text-center">
                Price: ${place?.price} / per night
            </div>
            <div className="border rounded-2xl mt-4">
                <div className="flex flex-col">
                    <div className="py-3 px-4">
                        <label>Check in:</label>
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}/>
                    </div>
                    <div className="py-3 px-4 border-t">
                        <label>Check out:</label>
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}/>
                    </div>
                </div>
                <div className="py-3 px-4 border-t">
                    <label>Number of guests:</label>
                    <input type="number" value={numberOfGuests} onChange={(e) => setNumberOfGuests(e.target.value)}/>
                </div>
                {numberOfNights > 0 && (
                    <div className="py-3 px-4 border-t">
                        <label>Your full name:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                        <label>Phone number:</label>
                        <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}/>
                    </div>
                )}
            </div>
            <button onClick={bookPlace} className="primary mt-4">
                Book this place
                {numberOfNights > 0 && (
                    <span> ${numberOfNights * place?.price}</span>
                )}
            </button>
        </div>
    )
}