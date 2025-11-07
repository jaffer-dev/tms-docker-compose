import { Avatar } from "antd";
import { getColorFromName, getFirstTwoChars } from "../../utils/Methods";

export const UserAvatar = ({ name }) => {
  return (
    <Avatar style={{ backgroundColor: getColorFromName(name) }}>
      {getFirstTwoChars(name)}
    </Avatar>
  );
};
