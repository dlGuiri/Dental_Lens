// components/layout/index.tsx (Updated)
import RoleBasedLayout from "./RoleBasedLayout";

interface PropsInterface {
  children: React.ReactNode;
}

const Layout = (props: PropsInterface) => {
  return (
    <RoleBasedLayout>
      {props.children}
    </RoleBasedLayout>
  );
};

export default Layout;