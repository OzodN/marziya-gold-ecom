package com.marziyagold.util;

import java.util.HashMap;
import java.util.Map;

public final class SlugUtils {

    private static final Map<Character, String> CYRILLIC_MAP = new HashMap<>();

    static {
        CYRILLIC_MAP.put('а', "a"); CYRILLIC_MAP.put('б', "b"); CYRILLIC_MAP.put('в', "v");
        CYRILLIC_MAP.put('г', "g"); CYRILLIC_MAP.put('д', "d"); CYRILLIC_MAP.put('е', "e");
        CYRILLIC_MAP.put('ё', "yo"); CYRILLIC_MAP.put('ж', "zh"); CYRILLIC_MAP.put('з', "z");
        CYRILLIC_MAP.put('и', "i"); CYRILLIC_MAP.put('й', "y"); CYRILLIC_MAP.put('к', "k");
        CYRILLIC_MAP.put('л', "l"); CYRILLIC_MAP.put('м', "m"); CYRILLIC_MAP.put('н', "n");
        CYRILLIC_MAP.put('о', "o"); CYRILLIC_MAP.put('п', "p"); CYRILLIC_MAP.put('р', "r");
        CYRILLIC_MAP.put('с', "s"); CYRILLIC_MAP.put('т', "t"); CYRILLIC_MAP.put('у', "u");
        CYRILLIC_MAP.put('ф', "f"); CYRILLIC_MAP.put('х', "kh"); CYRILLIC_MAP.put('ц', "ts");
        CYRILLIC_MAP.put('ч', "ch"); CYRILLIC_MAP.put('ш', "sh"); CYRILLIC_MAP.put('щ', "shch");
        CYRILLIC_MAP.put('ъ', ""); CYRILLIC_MAP.put('ы', "y"); CYRILLIC_MAP.put('ь', "");
        CYRILLIC_MAP.put('э', "e"); CYRILLIC_MAP.put('ю', "yu"); CYRILLIC_MAP.put('я', "ya");
    }

    private SlugUtils() {
    }

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        String lower = input.toLowerCase();
        for (int i = 0; i < lower.length(); i++) {
            char c = lower.charAt(i);
            String translit = CYRILLIC_MAP.get(c);
            if (translit != null) {
                sb.append(translit);
            } else if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
                sb.append(c);
            } else {
                sb.append('-');
            }
        }

        String slug = sb.toString();
        // Replace multiple consecutive hyphens with a single hyphen
        slug = slug.replaceAll("-+", "-");
        // Trim leading and trailing hyphens
        slug = slug.replaceAll("^-|-$", "");
        return slug;
    }
}
