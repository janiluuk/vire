-- Rename enum value for HDD removal (API + stored orders use new name).
ALTER TYPE "HddRemovalOption" RENAME VALUE 'VIRE_REMOVES' TO 'SPARKKI_REMOVES';
