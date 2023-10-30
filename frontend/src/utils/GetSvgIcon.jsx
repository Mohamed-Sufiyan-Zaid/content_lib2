import Plus from "../assets/icons/plus.svg";
import HumanIcon from "../assets/icons/humanIcon.png";

export { Plus, HumanIcon };

export default function GetSvgIcon({ icon, altText = "" }) {
  return <img src={icon} alt={altText} />;
}
