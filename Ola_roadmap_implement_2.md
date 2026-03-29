You can implement the Ola (Mind & Wellness) roadmap as four focused wellness modules layered on top of your existing VibeHealth stack (Bun + Hono + Prisma + Angular 21 + Soft Pop design), reusing the existing architecture, rewards system, and animation/design conventions. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/9468e54f-7d77-48da-ba78-ddce78e87f48/roadmap-ola-wellness.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=Px5FZlCoViOGR8Ijh1Avpmpscx8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

Below you’ll find:
- A brief architecture plan for the new models and APIs.
- Concrete “vibe code” prompts you can drop into an LLM (per milestone, backend + frontend).
- A focused analysis of libraries for sound, media, and visuals that fit cleanly into this stack.

***

## Architecture for Ola in VibeHealth

You already have a Bun/Hono/Prisma backend with metrics under `/api/v1/metrics` and a Postgres 16 schema. For Ola, wellness endpoints live under `/api/v1/wellness/*` with models like `MOOD_LOG`, `PERIOD_LOG`, `JOURNAL_ENTRY`, `MEDIA_ATTACHMENT`, and `FOCUS_SESSION` in `backend/prisma/schema.prisma` and frontend feature code in `frontend/src/app/features/wellness/*`. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/f642f9d4-9890-4760-845b-e9957cbab8fe/README.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=X8tRn3tKO0G%2BQiMD8bc98EmrcDQ%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

I’d keep the shape:

- **Backend**
  - Namespace: `backend/src/routes/wellness.routes.ts` mounting sub-routers:
    - `/mood`, `/journal`, `/period`, `/pregnancy`, `/focus`. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/9468e54f-7d77-48da-ba78-ddce78e87f48/roadmap-ola-wellness.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=Px5FZlCoViOGR8Ijh1Avpmpscx8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)
  - Prisma models with soft constraints:
    - `MoodLog` (per-day mood + optional note + tags).
    - `JournalEntry` + `MediaAttachment` (image/audio links).
    - `PeriodLog` (start date, flow intensity, symptoms).
    - `Pregnancy` (EDD, weeks, mode flag) + `KickEvent`, `ContractionEvent`.
    - `FocusSession` (type, duration, completed/abandoned, carrots awarded). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/9468e54f-7d77-48da-ba78-ddce78e87f48/roadmap-ola-wellness.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=Px5FZlCoViOGR8Ijh1Avpmpscx8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)
- **Frontend**
  - `features/wellness/journal`, `.../period`, `.../pregnancy`, `.../focus`, all using Angular 21 standalone components, signals, native control flow, and the mascot/rewards services in `core`. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6a449d71-aef9-4c62-87bc-dfb7d72daae9/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYE76BW2G5N&Signature=LgRTOMGrcs1Uno%2FDzmrW8yjHrvI%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJHMEUCIE%2B4J%2BXMTaAw22ekxxMha6opLybL6BSn1BADLmiOp9sYAiEAlBmt%2FjhsP3k0UvkR8IL9WmPB1xo2rWKG3y8dLhRkDPwq%2FAQI5P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDDfJR1mISkRSjxYnNirQBOxmuLJhGvP%2FNDsmSoLJkPI2q93ydZ5asa5hyP6Cbt8QD8JsLXFGFYc8S3LSPkGA2fFKsh3pbmKrRo0MBWdbv1EaNNL1sqP%2FsJGzEM2tlSbT2epkM8AwnOjuvn1JqQIbc6Yuj1TJs8Sp0pqD3OHeCc6LCp%2BBuTHw6W081U%2FtbxbC3e7BEoyubfaLlQSs41V2U8Efvie52y8sPR4CaMGNGfIgif2CYVKsq%2FmNyvHfptYrVrwfBSPK5TSe%2FQRnPPUV9jMwBiboMC1Qa7q8bHuHvjXgUlYg7lD3bgDddpHjHxCN3urAPjgpYu8496ZMaHPT78vxyWEZt%2FzKOBzhCkkPlEpwjwSyJxhj%2FECySP6dDS8Ph%2BmQ7hjGJWqGdLaOI1nLRftWZaz6gYxcylOnUOkiMNROMsK1PtjcqLu29khDd%2FPExtoy4KdhVFioEVM54XvzRvb9JGwrwh9KtH466g9TEOz7Z4aM19kkvA1wHXqVkaiqZeXxObaEtvq8eRpz4wFgg0rK0ULffxlHGSCrWe6EUklXmTJ0id2j7pHqhsGFQcuqLR2PLzkGycXhmKxPtdhqK3FS85pUYPAwxmiHa68ZgV%2Bx3fa%2FNBNWxzNnbw9spyyMFadmvOwmrzXrEXT325DdtYQr9IcLIiBl1wEt3urYjdlmoOYbobBkKifehpX4CpYStldJInN4Jqaupn0MTEtllRThW7ge%2F4yzVOvPhzZ5YWL470BVAL%2BEk9oRXV2JTHyK3WoFRfgV9tCHXiGgp6V5hqEShDHxPdflkrXJuAIQETkwraKbzgY6mAEc84tgSgnianQW2ZgzhdeRyyJfG6yLYqZmAibzubu1reE3UF47iUwIB6lOz4p4podwaO3OaLefmE%2BQtUGBVOrIA%2BcarhOb4NbGFUTsCX3f2evOUw%2BeP5n6ILrEKRIX09MP7qFJCxs3kWxk1aEA0bfSQHqXRyZpSc%2FcZZ0w2SPJ736OAKfBFk2JwbiDDYK1yd3Tje6iWnhfEw%3D%3D&Expires=1774637957)
  - Styling and motion via your Soft Pop design tokens + Tailwind, motion.dev, ngx-lottie, and lucide icons. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6d90cf90-9eec-460f-8ebc-b7ee171d9ba0/SKILL.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=UhwqpCe%2BvS2hz8MXp2XJApDuNhU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

***

## Milestone 1 – Mood & Journal “vibe-code” prompts

### Backend prompts (Prisma + Hono)

**Prompt 1 – Prisma models for mood + journal**

```text
You are a senior Bun + Hono + Prisma engineer working on the VibeHealth app.

Context:
- Backend runtime: Bun, API framework: Hono, ORM: Prisma, DB: Postgres 16.
- Existing schema at backend/prisma/schema.prisma.
- Wellness scope requires MOOD_LOG, JOURNAL_ENTRY, MEDIA_ATTACHMENT focused on daily mood and journaling.
- API namespace is /api/v1/wellness/* and routing is handled in backend/src/routes/wellness.routes.ts.

Task:
1. Extend schema.prisma with models suited for:
   - MoodLog: per-user, per-day (unique userId + date), 6-emoji mood (enum), optional free-text note, tags (string[] or join table).
   - JournalEntry: userId, createdAt, updatedAt, title (optional), richText (string), moodRef (optional foreign key to MoodLog), and a relation to MediaAttachment.
   - MediaAttachment: id, journalEntryId, type enum ('IMAGE' | 'AUDIO'), url, mimeType, durationSeconds? (for audio), createdAt.
2. Add appropriate @@index and @@unique constraints (e.g., unique mood per day per user).
3. Implement relations so that deleting a JournalEntry cascades to MediaAttachment.
4. Output the updated Prisma schema section only, ready to be pasted into schema.prisma.
5. Do NOT change existing models; only append or minimally integrate.

Follow Prisma/Postgres best practices and use snake_case table names if the project already does so.
```

**Prompt 2 – Hono CRUD routes for mood + journal**

```text
You are implementing new Hono routes for the VibeHealth backend.

Context:
- Runtime: Bun, Hono for HTTP routing under /api/v1.
- Wellness namespace must live under /api/v1/wellness/*.
- Prisma client already exists and is used in other routes.
- Validation is done with Zod.
- We need CRUD for:
  - Mood logs: daily upsert (one per day per user) and listing recent history.
  - Journal entries: create/read/update/delete with media attachments.
- RewardsService exists elsewhere to award “carrots” (+3 per journal entry / mood log).

Task:
1. Create a wellness.routes.ts module that:
   - Exports a Hono router mounted at /api/v1/wellness.
   - Contains sub-routes:
     - /mood: GET list, POST upsert (create/update the mood for a date).
     - /journal: GET list (paginated), GET /:id, POST create, PATCH /:id, DELETE /:id.
2. Use Zod schemas to validate request bodies (mood emoji enum, text lengths, allowed media types).
3. On successful mood log or journal creation, call into a RewardsService (assume an imported async function awardCarrots(userId, amount)).
4. Return JSON responses with typed payloads compatible with a TypeScript client.
5. Show the full TypeScript code for wellness.routes.ts, including Zod schemas and route wiring, but do not show Bun server bootstrap code.

Use idiomatic Hono patterns and Prisma client usage.
```

### Frontend prompts (Angular 21 + design system)

**Prompt 3 – Wellness journal feature shell**

```text
You are a senior Angular 21 engineer working in the VibeHealth frontend.

Context:
- Angular 21, standalone components, signals, native control flow (@if, @for, etc.).
- Project structure: frontend/src/app/features/wellness/*.
- Design system: Soft Pop (warm gradients, rounded cards, bunny mascot, Tailwind + CSS tokens).
- API: /api/v1/wellness/mood and /api/v1/wellness/journal.
- We want:
  - A “Wellness Journal” page showing:
    - A timeline list of recent journal entries (card list, inline delete).
    - A calendar view for selecting a day, seeing mood + journal.
    - Filters by tag and mood.
  - A 6-emoji mood selector + free-text input per day.
  - Streak counter chips and a small carrot reward indicator.

Task:
1. Generate a standalone Angular component WellnessJournalPageComponent under features/wellness/journal.
2. Use signals for state (entries, selectedDate, filters, loading, error).
3. Use a dedicated WellnessJournalService in core/wellness to:
   - Fetch mood/journal entries.
   - Upsert mood for a date.
   - Create/delete journal entries.
4. Implement HTML template with:
   - Native control flow for loading/error/content.
   - Timeline on the left, calendar selector + mood selector on the right (stacked on mobile).
   - Design tokens consistent with the Soft Pop system (rounded-xl cards, warm gradient header, chips for tags).
5. Use lucide icons via @lucide/angular for small icons (calendar, smile, frown, carrot).
6. Include minimal Tailwind/CSS classes to reflect the Soft Pop look, but keep it concise.

Output:
- wellness-journal.service.ts (service with readonly signals).
- wellness-journal-page.component.ts (component + template).
```

**Prompt 4 – Image/audio upload UX**

```text
You are extending the Wellness Journal page in Angular 21.

Context:
- We already have a WellnessJournalPageComponent and service.
- We want to attach image/audio files to journal entries.
- Backend accepts multipart form-data with files for /api/v1/wellness/journal.
- Design: Soft Pop cards, pill-shaped “Add media” buttons, inline chips showing attachments.

Task:
1. Update the page template to:
   - Include an “Add image/audio” control using a hidden <input type="file"> wired to a visible Soft Pop button.
   - Show a list of selected files (name, size) before submission, with removable chips.
2. Update the component logic to:
   - Track selected File[] in a signal.
   - Submit files via HttpClient using FormData when creating a new entry.
3. Include simple accessibility (labels, keyboard activation).
4. Use design tokens for chips (rounded-full, soft background) and show a small audio icon for audio attachments.

Output:
- Updated HTML template snippet and TypeScript for the component’s upload logic only.
```

***

## Milestone 2 – Period & Cycle Tracker prompts

### Backend prompts

**Prompt 5 – PeriodLog model + prediction helpers**

```text
You are enhancing the Prisma schema and backend logic for a period & cycle tracker.

Context:
- Prisma schema file: backend/prisma/schema.prisma.
- New model: PeriodLog (userId, startDate, endDate?, flowIntensity, symptoms[]).
- We need simple cycle prediction utilities: next period start date and fertile window estimates based on last N cycles.

Task:
1. Extend schema.prisma with a PeriodLog model:
   - userId FK, startDate (DateTime), endDate (optional), flowIntensity enum ('LIGHT', 'MEDIUM', 'HEAVY'), symptoms (string[] or separate table).
   - Index on (userId, startDate DESC).
2. Create a backend utility module (e.g. backend/src/services/period.ts) exporting:
   - function predictNextPeriod(logs: PeriodLog[]): Date | null
   - function estimateFertileWindow(nextPeriodStart: Date): { start: Date; end: Date }
   Using a simple average cycle length over the last N complete cycles.
3. Assume we can later wire this into HTTP routes; focus on models + pure functions.

Output:
- Prisma model snippet.
- TypeScript implementation of the prediction functions (no framework code).
```

**Prompt 6 – Hono routes for period logs & reminders**

```text
You are implementing Hono routes for the period tracker.

Context:
- Namespace: /api/v1/wellness/period.
- Model: PeriodLog in Prisma.
- Functions predictNextPeriod and estimateFertileWindow exist in a period service.
- We need:
  - POST /period/log to create or update a log.
  - GET /period/logs to list recent logs.
  - GET /period/prediction to return next period + fertile window.
  - Endpoints to configure contraceptive pill reminders (time of day, snooze duration) stored in DB.

Task:
1. Define Zod schemas for incoming bodies.
2. Implement the routes wired to Prisma and the prediction helpers.
3. Design JSON payloads that are easy to consume from Angular (ISO date strings, enums as strings).
4. Include placeholder handlers for scheduling web push/device notifications (commented or stubbed).

Output:
- wellness-period.routes.ts with complete Hono route implementations.
```

### Frontend prompts

**Prompt 7 – Period tracker UI**

```text
You are building the Period & Cycle Tracker feature in Angular 21 for VibeHealth.

Context:
- New route under /wellness/period, lazy-loaded.
- Design language: Soft Pop, warm gradients, pills, rounded cards.
- Data from /api/v1/wellness/period/*.
- We need:
  - A calendar-like view marking period days and predicted next period.
  - A sidebar or bottom sheet to log today’s period (start/stop, flow intensity, symptoms chips).
  - A small card showing predicted next period and fertile window.

Task:
1. Create a standalone PeriodTrackerPageComponent under features/wellness/period.
2. Use signals to hold logs, predictions, and selected date.
3. Implement an accessible, custom calendar using divs and CSS (no heavy calendar library), styled with Soft Pop tokens.
4. Use Tailwind-style classes in the template: rounded-xl cards, gradient headers, small chips for symptoms.
5. Wire the component to a PeriodTrackerService in core/wellness for API calls.

Output:
- period-tracker.service.ts.
- period-tracker-page.component.ts with inline template.
```

**Prompt 8 – Pill reminder settings panel**

```text
You are adding contraceptive pill reminder settings to the Period Tracker.

Context:
- Angular 21, reactive forms, signals.
- Endpoint: /api/v1/wellness/period/reminders (GET/PUT).
- UX: A Soft Pop “Reminder settings” card with:
  - Daily reminder time (time picker or HH:MM input).
  - Toggle for notifications on/off.
  - Snooze duration (e.g. 10, 20, 30 minutes).
- PWA will use Notifications + Service Worker later; for now we just persist settings.

Task:
1. Add a ReminderSettingsComponent (standalone) that:
   - Uses ReactiveFormsModule and a FormGroup for the above fields.
   - Loads initial values from the service on init.
   - Saves on submit with optimistic UI feedback.
2. Use native control flow for loading/error states.
3. Style using Soft Pop: card, primary CTA button with gradient, subtle helper text.

Output:
- reminder-settings.component.ts with template and basic styling classes.
```

***

## Milestone 3 – Pregnancy Mode prompts

### Backend prompts

**Prompt 9 – Pregnancy model and toggle**

```text
You are implementing Pregnancy mode in Prisma + Hono.

Context:
- Users can switch from Period Tracker to Pregnancy mode.
- Need a Pregnancy model tied to a user with:
  - id, userId, startDate or estimatedDueDate, createdAt, updatedAt, status enum ('ACTIVE', 'COMPLETED', 'LOST').
- Pregnancy mode disables period logging and enables pregnancy-specific logging (kicks, contractions, symptoms).

Task:
1. Add a Pregnancy model to schema.prisma with appropriate relations and indexes.
2. Add simple models for KickEvent and ContractionEvent referencing Pregnancy.
3. Implement a /api/v1/wellness/pregnancy router with:
   - POST /toggle to enter/exit pregnancy mode.
   - GET /status to fetch current mode and pregnancy progress (weeks).
   - POST /kicks and POST /contractions to log events.

Output:
- Prisma model snippets.
- wellness-pregnancy.routes.ts with Hono routes.
```

### Frontend prompts

**Prompt 10 – Pregnancy mode toggle + week-by-week UI**

```text
You are implementing Pregnancy Mode UI in Angular 21.

Context:
- When Pregnancy Mode is on, period UI is replaced with pregnancy UI.
- We need:
  - A visual toggle card to switch modes (Period vs Pregnancy).
  - A week-by-week guide UI with cards for each pregnancy week (title, short description).
  - Simple kick counter and contraction timer components.

Task:
1. Create a PregnancyModeService in core/wellness that:
   - Exposes signals for current mode, currentWeek, pregnancy data.
   - Calls /api/v1/wellness/pregnancy endpoints.
2. Build:
   - PregnancyModeToggleComponent (pill-style toggle, bunny mascot illustration).
   - PregnancyWeekGuideComponent that displays current week details and allows scrolling/browsing other weeks.
   - KickCounterComponent and ContractionTimerComponent using signals and native control flow.
3. Use motion.dev for subtle entrance animations for week cards and CTA buttons.
4. Make sure the components respect the Soft Pop design system (rounded cards, gradients, Soft typography).

Output:
- Service and three standalone component files with Angular 21 patterns (signals, inject(), native control flow).
```

***

## Milestone 4 – Relaxation & Focus Sessions prompts

### Backend prompts

**Prompt 11 – FocusSession model + aggregation**

```text
You are adding Focus & Relaxation sessions to the backend.

Context:
- Model name: FocusSession.
- Fields: id, userId, type enum ('POMODORO', 'BREATHING', 'AMBIENT'), startedAt, endedAt, durationSeconds, completed (boolean), carrotsAwarded (int).
- We need streak aggregations for consistent meditation/focus as well as carrot rewards.

Task:
1. Extend schema.prisma with FocusSession and appropriate indexes.
2. Implement a /api/v1/wellness/focus router with:
   - POST /sessions/start
   - POST /sessions/complete
   - GET /sessions/recent
   - GET /sessions/streaks (returns current streak length and longest streak).
3. Integrate RewardsService to award carrots for completed sessions and penalize early exit.

Output:
- Prisma model snippet.
- wellness-focus.routes.ts with Hono routes.
```

### Frontend prompts

**Prompt 12 – Ambient audio player + Pomodoro screen lock**

```text
You are building the Relaxation & Focus screen in Angular 21.

Context:
- UI requirements:
  - Ambient Audio player: list of background sounds (rain, forest, cafe), play/pause, volume, session timer.
  - Focus Helper: Pomodoro-style timer with optional “screen lock” overlay that discourages leaving the session (hook into routing/visibility events).
  - Bunny mascot reacts to completion (carrots!) or early exit (sad bunny).
- API endpoints: /api/v1/wellness/focus/*.
- Design: Soft Pop, spiral-loader component available, mascot component available.

Task:
1. Create FocusSessionsPageComponent (standalone) under features/wellness/focus.
2. Use signals to manage:
   - selectedSound, isPlaying, volume, remainingTime, isLocked, sessionState.
3. Implement:
   - A simple ambient audio player using HTMLAudioElement wrapped in an Angular service (no external audio library for now): play, pause, loop, volume.
   - A Pomodoro timer (25/5 minutes configurable) with start/pause/reset, countdown display, and integration with the backend session endpoints.
   - A full-screen overlay mode that appears when “Focus Lock” is enabled, with minimal UI and a clear exit button.
4. Use motion.dev micro-interactions for:
   - Button hover, timer entrance, bunny reactions.
5. Wire mascot state to sessionState (idle, focusing, happy, sad).

Output:
- focus-sessions-page.component.ts with template.
- focus-audio.service.ts for audio control.
- Modifications to Bunny mascot usage snippet.
```

***

## Libraries for sound, visuals, and media

### Audio & sound

Because you’re already PWA-first with Bun + Angular, I’d keep audio dependencies lightweight and explicit. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/f642f9d4-9890-4760-845b-e9957cbab8fe/README.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=X8tRn3tKO0G%2BQiMD8bc98EmrcDQ%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

- **Native HTMLAudioElement + small Angular service**
  - For simple ambient loops, timers, and play/pause/volume, a custom `FocusAudioService` wrapping `new Audio()` is often enough.
  - Pros: zero extra bundle weight, fully under your control, easy to integrate with signals and Angular lifecycle.
  - Cons: you must handle mobile autoplay restrictions, manual cross-fade if needed, and multiple tracks yourself.

- **Howler.js** (optional if you want more)
  - Gives you:
    - Cross-browser audio, sprite support, looping, group volume, fadeIn/fadeOut, and easier multiple-sound management.
  - Integration pattern:
    - Wrap a single `Howl` instance (or map of instances) in an Angular service and expose control methods + signals.
  - Trade-off:
    - Slight bundle increase; still reasonable if you plan richer soundscapes, crossfade, or multi-track scenes.

For Ola’s needs (ambient background, simple timers, a few sound cues), I’d start with a custom service and only introduce Howler if you feel pain around cross-browser quirks or more advanced features.

### Media upload & playback

You already use Angular HttpClient and Tailwind; adding a heavy upload library is often not necessary. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6d90cf90-9eec-460f-8ebc-b7ee171d9ba0/SKILL.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=UhwqpCe%2BvS2hz8MXp2XJApDuNhU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

- **Uploads**
  - Use `<input type="file" multiple>` + a thin “dropzone” wrapper component:
    - Pros: zero third‑party dependency, styleable with Soft Pop cards and gradients. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6d90cf90-9eec-460f-8ebc-b7ee171d9ba0/SKILL.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=UhwqpCe%2BvS2hz8MXp2XJApDuNhU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)
    - You can add drag‑and‑drop by handling `dragenter/dragover/drop` on a card div.
  - If you want a ready‑made solution:
    - `ngx-dropzone` or `ngx-filepond` can give you polished previews, drag‑and‑drop, and progress, but they will push design away from your highly customized Soft Pop look unless you restyle heavily.

- **Audio playback UI**
  - For ambient backgrounds, you don’t need waveform visualizations: simple time/remaining/time bar + icons is enough, implemented with CSS + motion.dev for micro-interactions. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6a449d71-aef9-4c62-87bc-dfb7d72daae9/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYE76BW2G5N&Signature=LgRTOMGrcs1Uno%2FDzmrW8yjHrvI%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJHMEUCIE%2B4J%2BXMTaAw22ekxxMha6opLybL6BSn1BADLmiOp9sYAiEAlBmt%2FjhsP3k0UvkR8IL9WmPB1xo2rWKG3y8dLhRkDPwq%2FAQI5P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDDfJR1mISkRSjxYnNirQBOxmuLJhGvP%2FNDsmSoLJkPI2q93ydZ5asa5hyP6Cbt8QD8JsLXFGFYc8S3LSPkGA2fFKsh3pbmKrRo0MBWdbv1EaNNL1sqP%2FsJGzEM2tlSbT2epkM8AwnOjuvn1JqQIbc6Yuj1TJs8Sp0pqD3OHeCc6LCp%2BBuTHw6W081U%2FtbxbC3e7BEoyubfaLlQSs41V2U8Efvie52y8sPR4CaMGNGfIgif2CYVKsq%2FmNyvHfptYrVrwfBSPK5TSe%2FQRnPPUV9jMwBiboMC1Qa7q8bHuHvjXgUlYg7lD3bgDddpHjHxCN3urAPjgpYu8496ZMaHPT78vxyWEZt%2FzKOBzhCkkPlEpwjwSyJxhj%2FECySP6dDS8Ph%2BmQ7hjGJWqGdLaOI1nLRftWZaz6gYxcylOnUOkiMNROMsK1PtjcqLu29khDd%2FPExtoy4KdhVFioEVM54XvzRvb9JGwrwh9KtH466g9TEOz7Z4aM19kkvA1wHXqVkaiqZeXxObaEtvq8eRpz4wFgg0rK0ULffxlHGSCrWe6EUklXmTJ0id2j7pHqhsGFQcuqLR2PLzkGycXhmKxPtdhqK3FS85pUYPAwxmiHa68ZgV%2Bx3fa%2FNBNWxzNnbw9spyyMFadmvOwmrzXrEXT325DdtYQr9IcLIiBl1wEt3urYjdlmoOYbobBkKifehpX4CpYStldJInN4Jqaupn0MTEtllRThW7ge%2F4yzVOvPhzZ5YWL470BVAL%2BEk9oRXV2JTHyK3WoFRfgV9tCHXiGgp6V5hqEShDHxPdflkrXJuAIQETkwraKbzgY6mAEc84tgSgnianQW2ZgzhdeRyyJfG6yLYqZmAibzubu1reE3UF47iUwIB6lOz4p4podwaO3OaLefmE%2BQtUGBVOrIA%2BcarhOb4NbGFUTsCX3f2evOUw%2BeP5n6ILrEKRIX09MP7qFJCxs3kWxk1aEA0bfSQHqXRyZpSc%2FcZZ0w2SPJ736OAKfBFk2JwbiDDYK1yd3Tje6iWnhfEw%3D%3D&Expires=1774637957)
  - If you later want waveform/scrubbing:
    - `wavesurfer.js` integrated via a small Angular wrapper component is a good option, but I’d defer until you have clear requirements, as it’s heavier than you likely need for v1.

### Visuals & motion

You already have a strong base here; Ola should lean into existing standards instead of adding new heavy libs. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/f642f9d4-9890-4760-845b-e9957cbab8fe/README.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=X8tRn3tKO0G%2BQiMD8bc98EmrcDQ%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

- **Motion.dev (`motion/mini`)** – primary programmatic animation
  - You’re already using it for staggered entrances, hover effects, etc. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6a449d71-aef9-4c62-87bc-dfb7d72daae9/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYE76BW2G5N&Signature=LgRTOMGrcs1Uno%2FDzmrW8yjHrvI%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJHMEUCIE%2B4J%2BXMTaAw22ekxxMha6opLybL6BSn1BADLmiOp9sYAiEAlBmt%2FjhsP3k0UvkR8IL9WmPB1xo2rWKG3y8dLhRkDPwq%2FAQI5P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDDfJR1mISkRSjxYnNirQBOxmuLJhGvP%2FNDsmSoLJkPI2q93ydZ5asa5hyP6Cbt8QD8JsLXFGFYc8S3LSPkGA2fFKsh3pbmKrRo0MBWdbv1EaNNL1sqP%2FsJGzEM2tlSbT2epkM8AwnOjuvn1JqQIbc6Yuj1TJs8Sp0pqD3OHeCc6LCp%2BBuTHw6W081U%2FtbxbC3e7BEoyubfaLlQSs41V2U8Efvie52y8sPR4CaMGNGfIgif2CYVKsq%2FmNyvHfptYrVrwfBSPK5TSe%2FQRnPPUV9jMwBiboMC1Qa7q8bHuHvjXgUlYg7lD3bgDddpHjHxCN3urAPjgpYu8496ZMaHPT78vxyWEZt%2FzKOBzhCkkPlEpwjwSyJxhj%2FECySP6dDS8Ph%2BmQ7hjGJWqGdLaOI1nLRftWZaz6gYxcylOnUOkiMNROMsK1PtjcqLu29khDd%2FPExtoy4KdhVFioEVM54XvzRvb9JGwrwh9KtH466g9TEOz7Z4aM19kkvA1wHXqVkaiqZeXxObaEtvq8eRpz4wFgg0rK0ULffxlHGSCrWe6EUklXmTJ0id2j7pHqhsGFQcuqLR2PLzkGycXhmKxPtdhqK3FS85pUYPAwxmiHa68ZgV%2Bx3fa%2FNBNWxzNnbw9spyyMFadmvOwmrzXrEXT325DdtYQr9IcLIiBl1wEt3urYjdlmoOYbobBkKifehpX4CpYStldJInN4Jqaupn0MTEtllRThW7ge%2F4yzVOvPhzZ5YWL470BVAL%2BEk9oRXV2JTHyK3WoFRfgV9tCHXiGgp6V5hqEShDHxPdflkrXJuAIQETkwraKbzgY6mAEc84tgSgnianQW2ZgzhdeRyyJfG6yLYqZmAibzubu1reE3UF47iUwIB6lOz4p4podwaO3OaLefmE%2BQtUGBVOrIA%2BcarhOb4NbGFUTsCX3f2evOUw%2BeP5n6ILrEKRIX09MP7qFJCxs3kWxk1aEA0bfSQHqXRyZpSc%2FcZZ0w2SPJ736OAKfBFk2JwbiDDYK1yd3Tje6iWnhfEw%3D%3D&Expires=1774637957)
  - For Ola:
    - Animate mood selector emoji hover/selection.
    - Animate calendar cells or week cards on navigation.
    - Subtle spring animations for start/stop timers, bunny reactions.
  - Keep using `ViewChildren` + `ElementRef` with `motion/mini` per the existing patterns. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6a449d71-aef9-4c62-87bc-dfb7d72daae9/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYE76BW2G5N&Signature=LgRTOMGrcs1Uno%2FDzmrW8yjHrvI%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJHMEUCIE%2B4J%2BXMTaAw22ekxxMha6opLybL6BSn1BADLmiOp9sYAiEAlBmt%2FjhsP3k0UvkR8IL9WmPB1xo2rWKG3y8dLhRkDPwq%2FAQI5P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDDfJR1mISkRSjxYnNirQBOxmuLJhGvP%2FNDsmSoLJkPI2q93ydZ5asa5hyP6Cbt8QD8JsLXFGFYc8S3LSPkGA2fFKsh3pbmKrRo0MBWdbv1EaNNL1sqP%2FsJGzEM2tlSbT2epkM8AwnOjuvn1JqQIbc6Yuj1TJs8Sp0pqD3OHeCc6LCp%2BBuTHw6W081U%2FtbxbC3e7BEoyubfaLlQSs41V2U8Efvie52y8sPR4CaMGNGfIgif2CYVKsq%2FmNyvHfptYrVrwfBSPK5TSe%2FQRnPPUV9jMwBiboMC1Qa7q8bHuHvjXgUlYg7lD3bgDddpHjHxCN3urAPjgpYu8496ZMaHPT78vxyWEZt%2FzKOBzhCkkPlEpwjwSyJxhj%2FECySP6dDS8Ph%2BmQ7hjGJWqGdLaOI1nLRftWZaz6gYxcylOnUOkiMNROMsK1PtjcqLu29khDd%2FPExtoy4KdhVFioEVM54XvzRvb9JGwrwh9KtH466g9TEOz7Z4aM19kkvA1wHXqVkaiqZeXxObaEtvq8eRpz4wFgg0rK0ULffxlHGSCrWe6EUklXmTJ0id2j7pHqhsGFQcuqLR2PLzkGycXhmKxPtdhqK3FS85pUYPAwxmiHa68ZgV%2Bx3fa%2FNBNWxzNnbw9spyyMFadmvOwmrzXrEXT325DdtYQr9IcLIiBl1wEt3urYjdlmoOYbobBkKifehpX4CpYStldJInN4Jqaupn0MTEtllRThW7ge%2F4yzVOvPhzZ5YWL470BVAL%2BEk9oRXV2JTHyK3WoFRfgV9tCHXiGgp6V5hqEShDHxPdflkrXJuAIQETkwraKbzgY6mAEc84tgSgnianQW2ZgzhdeRyyJfG6yLYqZmAibzubu1reE3UF47iUwIB6lOz4p4podwaO3OaLefmE%2BQtUGBVOrIA%2BcarhOb4NbGFUTsCX3f2evOUw%2BeP5n6ILrEKRIX09MP7qFJCxs3kWxk1aEA0bfSQHqXRyZpSc%2FcZZ0w2SPJ736OAKfBFk2JwbiDDYK1yd3Tje6iWnhfEw%3D%3D&Expires=1774637957)

- **CSS keyframes + Soft Pop tokens**
  - For background breathing, float animations, and Soft Pop “texture” (noise, blobs), reuse the keyframe and background patterns from the design system. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6d90cf90-9eec-460f-8ebc-b7ee171d9ba0/SKILL.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=UhwqpCe%2BvS2hz8MXp2XJApDuNhU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)
  - That’s ideal for:
    - Relaxation backgrounds (gradients + subtle blobs).
    - Loading states using your spiral loader + simple CSS pulses. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6d90cf90-9eec-460f-8ebc-b7ee171d9ba0/SKILL.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=UhwqpCe%2BvS2hz8MXp2XJApDuNhU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

- **ngx-lottie** – complex vector animations
  - Already part of the stack for mascot/animated icons; use it selectively for:
    - A more expressive bunny animation on focus completion or mood streaks.
    - Short one-shot success/confetti animations for new streak milestones.
  - Keep JSON small and store them in `/assets/animations`, as you already do. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6a449d71-aef9-4c62-87bc-dfb7d72daae9/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYE76BW2G5N&Signature=LgRTOMGrcs1Uno%2FDzmrW8yjHrvI%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJHMEUCIE%2B4J%2BXMTaAw22ekxxMha6opLybL6BSn1BADLmiOp9sYAiEAlBmt%2FjhsP3k0UvkR8IL9WmPB1xo2rWKG3y8dLhRkDPwq%2FAQI5P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDDfJR1mISkRSjxYnNirQBOxmuLJhGvP%2FNDsmSoLJkPI2q93ydZ5asa5hyP6Cbt8QD8JsLXFGFYc8S3LSPkGA2fFKsh3pbmKrRo0MBWdbv1EaNNL1sqP%2FsJGzEM2tlSbT2epkM8AwnOjuvn1JqQIbc6Yuj1TJs8Sp0pqD3OHeCc6LCp%2BBuTHw6W081U%2FtbxbC3e7BEoyubfaLlQSs41V2U8Efvie52y8sPR4CaMGNGfIgif2CYVKsq%2FmNyvHfptYrVrwfBSPK5TSe%2FQRnPPUV9jMwBiboMC1Qa7q8bHuHvjXgUlYg7lD3bgDddpHjHxCN3urAPjgpYu8496ZMaHPT78vxyWEZt%2FzKOBzhCkkPlEpwjwSyJxhj%2FECySP6dDS8Ph%2BmQ7hjGJWqGdLaOI1nLRftWZaz6gYxcylOnUOkiMNROMsK1PtjcqLu29khDd%2FPExtoy4KdhVFioEVM54XvzRvb9JGwrwh9KtH466g9TEOz7Z4aM19kkvA1wHXqVkaiqZeXxObaEtvq8eRpz4wFgg0rK0ULffxlHGSCrWe6EUklXmTJ0id2j7pHqhsGFQcuqLR2PLzkGycXhmKxPtdhqK3FS85pUYPAwxmiHa68ZgV%2Bx3fa%2FNBNWxzNnbw9spyyMFadmvOwmrzXrEXT325DdtYQr9IcLIiBl1wEt3urYjdlmoOYbobBkKifehpX4CpYStldJInN4Jqaupn0MTEtllRThW7ge%2F4yzVOvPhzZ5YWL470BVAL%2BEk9oRXV2JTHyK3WoFRfgV9tCHXiGgp6V5hqEShDHxPdflkrXJuAIQETkwraKbzgY6mAEc84tgSgnianQW2ZgzhdeRyyJfG6yLYqZmAibzubu1reE3UF47iUwIB6lOz4p4podwaO3OaLefmE%2BQtUGBVOrIA%2BcarhOb4NbGFUTsCX3f2evOUw%2BeP5n6ILrEKRIX09MP7qFJCxs3kWxk1aEA0bfSQHqXRyZpSc%2FcZZ0w2SPJ736OAKfBFk2JwbiDDYK1yd3Tje6iWnhfEw%3D%3D&Expires=1774637957)

- **Charts & streak visualizations**
  - For Ola, you need mostly simple streak and progress viz:
    - A linear streak bar with Soft Pop colors.
    - Small sparkline for mood over time.
  - You can implement these with:
    - Simple `<div>`-based bars + CSS gradients and border-radius.
    - Or minimalist inline SVG components in Angular (no chart lib).
  - Unless you expect a lot of metrics-heavy graphs, I’d avoid heavy libraries like `ng-apexcharts` or `ngx-charts` for this feature; your current stack + SVG is enough and keeps design consistent.

### Date/time & prediction helpers

- **date-fns or dayjs** for date math
  - For cycle prediction, streak calculations, and timer durations, using `date-fns` or `dayjs` keeps the logic clean and testable.
  - Integration:
    - Create small pure functions (already requested in prompt 5) and call them from routes.
  - Keeps complexity away from components and Hono route handlers.

***

## How to use these prompts effectively

You can treat each prompt block as a “unit of work” for your coding assistant: paste one, review the generated diff, then adjust and iterate manually where needed (especially for naming and design‑system alignment). The prompts are written to stay within your current tech stack (Bun/Hono/Prisma/Angular 21, Tailwind, motion.dev, Soft Pop design, lucide + mascot components) so you get clean, idiomatic scaffolding rather than random library choices. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/9468e54f-7d77-48da-ba78-ddce78e87f48/roadmap-ola-wellness.md?AWSAccessKeyId=ASIA2F3EMEYE6MESDWE6&Signature=Px5FZlCoViOGR8Ijh1Avpmpscx8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBoaCXVzLWVhc3QtMSJHMEUCIH2KGQD8ZqMJRPv%2FVSR3y3VqpNwF1XNAM0eV3QKB5%2BSaAiEAmoFYbozBRdpBr%2Bt7GeGBOUs6xpsGmHF%2BL4VTfNXNmAUq%2FAQI4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDEd4V0Fup1DGOM6UnCrQBHDm9LnPGS9c1Pcx%2Bl2YCIWMraLvH%2BXKZUrQBlO3sTUZwn9vwKRYW03oz%2F%2F53jpJ%2BbGmdqB09qF9k9ouB8cORn2MYy%2BNk59yf%2FJ%2BhPJCgoi6SbgYVtjl9AAZdShBGDm%2Fr7EYb2bSHDpEARZ2bOcYrlKSaL8pdzpROIJwu5yL5FagI9R%2F8LIGGuqvThTnuvjxDcQaoXV7%2BMuuF4iBYvX6GN7VgJ53X%2FFzbr7FtmcdohUyeW7Q1ZdPc3NmEP%2Bks5MwSpx0XORYB%2BGjnK6z2fr1k%2Bqebl4CsxdsX1mYgFZpomQJ9HR3KgdTFiXtH5hVI3H3anOEVbHoqkzpYxWQhlJmdFXIeEPE0ZpKAlFTlhewBCQj56bIbV19XXz%2Fy4k82ZyhzfBcKWROBX4TRty7L7c4omdVdOsO9MnpfYR4l0jryeQHOqavLfDdQ%2BHd1QdSiTtp6s5j0aSySzB0AhOTr0pWg1Sq7W5%2FOmZv2RzWjOvZLNAFInHG7E06ROkgH4AHhqjl9dHA3u6DV5pSdgved%2F2upMiIFleqVWedXJEjDSZPQsGuaM%2Be8K9neYp4hXIrArmWHLhilSq%2F4G4BXI%2FabtkjMia8MYX4s8F2XYFkdyjR0U0cBd0RoMSHAPi78ohuoGPEW%2Fo9JjSznEeR9bjnJLvqVQiPPDOaAIkpmzJX9Dd0H9v7iZSQS9fHNL2BbpeKygEibuTh5eVRoDmpWpzo%2FC1lvc2GHfHFT88PztYq8OW%2FztUIQakt3qbzLwNW9dK%2FBV%2F%2FZq8KPdcE6243VMN7hoLisdcwm42bzgY6mAHIt9IuQ%2F6tV5maHqFCMGKxIiHTOsytgxtbSeRRWi1lOHeCXy8%2Bl0l29C%2BdBvA1qq%2FDUoUj6sFR8175i%2Fz1KmiNzvyR151geD%2Bj6IeAqRq7TRN4f8%2F7KvCqad884cIUZQ5PM6zsCM1D9z9QWAmWeGXdGzjGQCgJGuWoqaDaZInQL2pfUtmP5OD2nLRCf19OJ97U0T615nGOQQ%3D%3D&Expires=1774637957)

If you want, next step I can:
- Narrow these down into a step‑by‑step sequence (which prompts to run first, in what order).
- Or design specific prompt variants for tests (Prisma/Hono unit tests, Angular component tests) following the testing patterns in your frontend skill doc. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/6a449d71-aef9-4c62-87bc-dfb7d72daae9/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYE76BW2G5N&Signature=LgRTOMGrcs1Uno%2FDzmrW8yjHrvI%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJHMEUCIE%2B4J%2BXMTaAw22ekxxMha6opLybL6BSn1BADLmiOp9sYAiEAlBmt%2FjhsP3k0UvkR8IL9WmPB1xo2rWKG3y8dLhRkDPwq%2FAQI5P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDDfJR1mISkRSjxYnNirQBOxmuLJhGvP%2FNDsmSoLJkPI2q93ydZ5asa5hyP6Cbt8QD8JsLXFGFYc8S3LSPkGA2fFKsh3pbmKrRo0MBWdbv1EaNNL1sqP%2FsJGzEM2tlSbT2epkM8AwnOjuvn1JqQIbc6Yuj1TJs8Sp0pqD3OHeCc6LCp%2BBuTHw6W081U%2FtbxbC3e7BEoyubfaLlQSs41V2U8Efvie52y8sPR4CaMGNGfIgif2CYVKsq%2FmNyvHfptYrVrwfBSPK5TSe%2FQRnPPUV9jMwBiboMC1Qa7q8bHuHvjXgUlYg7lD3bgDddpHjHxCN3urAPjgpYu8496ZMaHPT78vxyWEZt%2FzKOBzhCkkPlEpwjwSyJxhj%2FECySP6dDS8Ph%2BmQ7hjGJWqGdLaOI1nLRftWZaz6gYxcylOnUOkiMNROMsK1PtjcqLu29khDd%2FPExtoy4KdhVFioEVM54XvzRvb9JGwrwh9KtH466g9TEOz7Z4aM19kkvA1wHXqVkaiqZeXxObaEtvq8eRpz4wFgg0rK0ULffxlHGSCrWe6EUklXmTJ0id2j7pHqhsGFQcuqLR2PLzkGycXhmKxPtdhqK3FS85pUYPAwxmiHa68ZgV%2Bx3fa%2FNBNWxzNnbw9spyyMFadmvOwmrzXrEXT325DdtYQr9IcLIiBl1wEt3urYjdlmoOYbobBkKifehpX4CpYStldJInN4Jqaupn0MTEtllRThW7ge%2F4yzVOvPhzZ5YWL470BVAL%2BEk9oRXV2JTHyK3WoFRfgV9tCHXiGgp6V5hqEShDHxPdflkrXJuAIQETkwraKbzgY6mAEc84tgSgnianQW2ZgzhdeRyyJfG6yLYqZmAibzubu1reE3UF47iUwIB6lOz4p4podwaO3OaLefmE%2BQtUGBVOrIA%2BcarhOb4NbGFUTsCX3f2evOUw%2BeP5n6ILrEKRIX09MP7qFJCxs3kWxk1aEA0bfSQHqXRyZpSc%2FcZZ0w2SPJ736OAKfBFk2JwbiDDYK1yd3Tje6iWnhfEw%3D%3D&Expires=1774637957)