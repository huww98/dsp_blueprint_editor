#!/bin/bash

BASE='/path/to/AS_exports'

python3 gen_items.py < $BASE/MonoBehaviour/ItemProtoSet.json > itemsData.ts
python3 gen_midi.py < $BASE/MonoBehaviour/MIDIProtoSet.json > midi.ts
python3 gen_recipes.py < $BASE/MonoBehaviour/RecipeProtoSet.json > recipesData.ts
python3 gen_signal_icons.py < $BASE/MonoBehaviour/SignalProtoSet.json > signalIconsData.ts
python3 gen_tech_icons.py < $BASE/MonoBehaviour/TechProtoSet.json > techIconsData.ts

find $BASE/Texture2D -regex '.*/[0-9]+.png' | xargs cp -t ../assets/icons/tech/
find $BASE/Texture2D -regex '.*/signal-[0-9]+.png' | xargs cp -t ../assets/icons/signal/
cp $BASE/itemrecipe/*.png ../assets/icons/item_recipe/

python3 i18n.py $BASE/MonoBehaviour "$GAME_BASE/Locale" -o ../locales
