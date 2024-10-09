import React, { useState, useEffect, useCallback } from 'react';

interface Parameters {
  rhyming: number;
  divinity: number;
  oblique: number;
  smearing: number;
}

const WordProcessor: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [inspirationWords, setInspirationWords] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [parameters, setParameters] = useState<Parameters>({
    rhyming: 1,
    divinity: 1,
    oblique: 1,
    smearing: 1,
  });

  const generateSuggestions = useCallback(async () => {
    // TODO: Replace with actual API call
    const mockSuggestions = await mockAICall(content, inspirationWords, parameters);
    setSuggestions(mockSuggestions);
  }, [content, inspirationWords, parameters]);

  useEffect(() => {
    const debounceTimer = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(debounceTimer);
  }, [generateSuggestions]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleInspirationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInspirationWords(e.target.value);
  };

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({
      ...parameters,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setContent((prevContent) => prevContent + ' ' + suggestion);
  };

  // Mock AI call for demonstration purposes
  const mockAICall = async (text: string, inspiration: string, params: Parameters): Promise<string[]> => {
    // In a real implementation, this would be an API call to your AI service
    return ['Suggested word 1', 'Suggested phrase 2', 'Inspired line 3'];
  };

  return (
    <div className="word-processor flex flex-col gap-4 p-4 bg-black text-white font-serif">
      <div className="editor">
        <textarea
          className="w-full h-64 p-2 bg-black text-white font-serif text-lg border border-gray-700 resize-y focus:outline-none focus:border-gray-500"
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing here..."
        />
      </div>
      <div className="controls flex flex-col md:flex-row gap-4">
        <div className="parameters flex-1">
          <h3 className="text-xl font-bold mb-2">Parameters</h3>
          {Object.entries(parameters).map(([key, value]) => (
            <label key={key} className="block mb-2">
              <span className="capitalize">{key}:</span>
              <input
                type="range"
                name={key}
                min="1"
                max="5"
                value={value}
                onChange={handleParameterChange}
                className="w-full mt-1"
              />
              <span className="ml-2">{value}</span>
            </label>
          ))}
        </div>
        <div className="inspiration flex-1">
          <h3 className="text-xl font-bold mb-2">Inspiration Parking Lot</h3>
          <textarea
            className="w-full h-32 p-2 bg-black text-white font-serif text-lg border border-gray-700 resize-y focus:outline-none focus:border-gray-500"
            value={inspirationWords}
            onChange={handleInspirationChange}
            placeholder="Add words for inspiration..."
          />
        </div>
      </div>
      <button 
        onClick={generateSuggestions}
        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors font-sans"
      >
        Generate Suggestions
      </button>
      <div className="suggestions">
        <h3 className="text-xl font-bold mb-2">AI Suggestions</h3>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer p-2 bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WordProcessor;