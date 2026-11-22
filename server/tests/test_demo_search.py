import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
from test_search import criteria


@unittest.skipUnless(shutil.which("node"), "Node.js is needed to export the shared demo data")
class DemoSearchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        directory = cls.enterClassContext(tempfile.TemporaryDirectory())
        cls.fixture = Path(directory) / "demo-listings.json"
        exporter = Path(main.__file__).with_name("export-demo.mjs")
        subprocess.run(
            ["node", "--experimental-strip-types", str(exporter), str(cls.fixture)],
            check=True,
        )

    def setUp(self):
        self.client = self.enterContext(TestClient(main.app))
        self.enterContext(patch.dict(os.environ, {"US06_DEMO_LISTINGS_FILE": str(self.fixture)}))
        self.load_supabase = self.enterContext(patch("main.load_listings"))
        self.addCleanup(self.load_supabase.assert_not_called)

    def test_mocked_gemini_criteria_rank_the_shared_demo_listings(self):
        cases = [
            ("jazz tonight", criteria(when="tonight", keywords="jazz"), ["Tonight"], set()),
            ("jazz", criteria(keywords="jazz"), [], {"demo-02"}),
            ("indoor activities", criteria(is_indoor=True), ["Indoor"],
             {"demo-01", "demo-02", "demo-04", "demo-07", "demo-09", "demo-10"}),
            ("family-friendly activities", criteria(audience="Family"), ["Family"],
             {"demo-01", "demo-04", "demo-06", "demo-10", "demo-13", "demo-16"}),
        ]
        for query, extracted, chips, expected_ids in cases:
            with self.subTest(query=query), patch("main.extract_criteria", return_value=extracted):
                response = self.client.post("/search", json={"query": query})
                self.assertEqual(response.status_code, 200)
                result = response.json()
                self.assertFalse(result["usedFallback"])
                self.assertEqual(result["criteria"], chips)
                self.assertEqual({match["listing"]["id"] for match in result["matches"]}, expected_ids)

    def test_demo_falls_back_when_gemini_key_is_missing(self):
        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
            response = self.client.post("/search", json={"query": "indoor activities"})
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertTrue(result["usedFallback"])
        self.assertEqual(len(result["matches"]), 6)

    def test_missing_fixture_returns_503(self):
        with patch.dict(os.environ, {"US06_DEMO_LISTINGS_FILE": str(self.fixture.with_suffix(".missing"))}):
            response = self.client.post("/search", json={"query": "jazz"})
        self.assertEqual(response.status_code, 503)
