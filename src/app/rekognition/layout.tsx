import MenuDrawer from "../components/menu-drawer/MenuDrawer";

export default function RekognitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MenuDrawer />
      {children}
    </>
  );
}
