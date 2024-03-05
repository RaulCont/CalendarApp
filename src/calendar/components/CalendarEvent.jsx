

export const CalendarEvent = ({event}) => {

    const {title, user } = event;

    // console.log(props);
  
    return (
        <>
            <strong>{title}</strong>
            <span> - {user.name}</span>

        </>
    )
}
