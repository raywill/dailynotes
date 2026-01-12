rm -fr /Applications/DailyNotes.app
cp -r dist/mas-arm64/DailyNotes.app /Applications/
[ $? -eq 0 ] && echo "install success" || echo "install fail with code $?"

