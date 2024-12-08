
export default function getDisplayDate( dateTime ) {
    //* Get the current date
    const currentTime = new Date();
    const theReceivedTime = new Date(dateTime.seconds * 1000);
    //* Get the difference in milliseconds
    const diff = theReceivedTime.getTime() - currentTime.getTime();
    if (diff <= 0) {
        return {
            case: "0",
            data: `ended ${theReceivedTime.getDay()}/${theReceivedTime.getMonth()}/${theReceivedTime.getFullYear()}`
      }; // Target date has passed
    }
  
    // Calculate time components
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365)); // Approximate years
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30.44)); // Approximate months
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
    // Build the output string
    return {
        case: "1",
        data: {
            years: years,
            months: months,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds:seconds
        }
    }
  }
  