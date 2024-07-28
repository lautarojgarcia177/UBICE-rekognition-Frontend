"use client";

import { useDisclosure } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";
import { Tag, Download } from "lucide-react";
import NextLink from "next/link";
import { Link, Divider } from "@chakra-ui/react";

const menuEntries = [
  {
    title: "Reconocimiento numérico",
    path: "/rekognition/reconocimiento-numerico",
    icon: <Tag />,
  },
  {
    title: "Descargar paquetes de fotos etiquetadas",
    path: "/rekognition/descargar-fotos-etiquetadas-por-evento",
    icon: <Download />,
  },
];

export default function DrawerExample() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>
        <HamburgerIcon />
      </Button>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />

          <DrawerBody>
            {menuEntries.map(({ title, icon, path }, index) => (
              <Link key={title} as={NextLink} href={path} onClick={onClose}>
                <div className="mt-6 mb-6 flex items-start">
                  {icon}
                  <span>&nbsp;</span>
                  {title}
                </div>
                <Divider />
              </Link>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
