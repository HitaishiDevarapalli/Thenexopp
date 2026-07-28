package com.nexopp.ai.tools;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

@Component
public class ContentSearchTool {

    public List<?> searchBlogs(String keyword) {
        return Collections.emptyList();
    }

    public List<?> searchFaqs(String keyword) {
        return Collections.emptyList();
    }

    public List<?> searchPolicies(String type) {
        return Collections.emptyList();
    }
}
