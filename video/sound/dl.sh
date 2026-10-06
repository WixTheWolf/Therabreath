# usage: bash dl.sh list.txt   (lines: NAME URL); downloads into raw/ in parallel, skipping files already present
list="$(realpath "$1")"
cd "$(dirname "$0")/raw"
while read -r n u; do [ -z "$n" ] && continue; [ -s "$n.mp3" ] || curl -sSf -o "$n.mp3" "$u" & done < "$list"; wait
ls | wc -l
