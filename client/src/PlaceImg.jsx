export default function PlaceImg({src, index=0, className=null}) {
    if(!src.photos?.length) {
        return ''
    }
    if(!className) {
        className = "object-cover"
    }
    return (
        <img className={className} src={src.photos[index]} alt="photo" />
    )
}