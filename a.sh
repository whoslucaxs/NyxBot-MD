#!/bin/bash
rm -f -r /node_modules/@adiwajshing/baileys-md
git clone https://github.com/adiwajshing/baileys.git -b multi-device
mv baileys baileys-md/
cd baileys-md/
yarn
cd ..
mv baileys-md/ node_modules/@adiwajshing/