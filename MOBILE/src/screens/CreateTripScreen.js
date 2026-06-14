import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const STEPS = ['Destination', 'Dates', 'Budget', 'Travelers', 'Activities'];

export default function CreateTripScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialDestination = route.params?.destination?.name || '';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    destination: initialDestination,
    dates: 'Flexible',
    budget: 'Mid-range',
    travelers: '2 Adults',
    activities: ['Culture', 'Food']
  });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      // Complete Flow
      navigation.replace('ItineraryBuilder', { formData });
    }
  };

  const renderProgress = () => (
    <View className="flex-row items-center justify-between mb-8">
      {STEPS.map((step, index) => (
        <View key={step} className="items-center flex-1">
          <View 
            className={`w-8 h-8 rounded-full items-center justify-center mb-1 
              ${index < currentStep ? 'bg-primary' : index === currentStep ? 'bg-primary/20 border-2 border-primary' : 'bg-slate-100'}`}
          >
            {index < currentStep ? (
              <CheckCircle2 size={16} color="#fff" />
            ) : (
              <Text className={`text-xs font-bold ${index === currentStep ? 'text-primary' : 'text-slate-400'}`}>{index + 1}</Text>
            )}
          </View>
          <Text className={`text-[10px] text-center ${index <= currentStep ? 'text-primary font-bold' : 'text-slate-400'}`}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text className="text-2xl font-black text-slate-900 mb-2">Where do you want to go?</Text>
            <Text className="text-slate-500 mb-6 text-base">Search for a city, country, or region.</Text>
            <TextInput
              className="bg-white h-14 rounded-2xl px-5 text-base font-medium shadow-sm border border-slate-100"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 }}
              placeholder="e.g. Paris, France"
              value={formData.destination}
              onChangeText={t => setFormData({...formData, destination: t})}
            />
          </View>
        );
      case 1:
        return (
          <View>
            <Text className="text-2xl font-black text-slate-900 mb-2">When are you traveling?</Text>
            <View className="flex-row flex-wrap mt-4">
              {['Exact Dates', 'Flexible', 'Next Month', 'Summer 2026'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setFormData({...formData, dates: opt})}
                  className={`w-[48%] p-4 rounded-2xl border mb-3 ${formData.dates === opt ? 'bg-primary/10 border-primary' : 'bg-white border-slate-200'} mr-2`}
                >
                  <Text className={`text-center font-bold ${formData.dates === opt ? 'text-primary' : 'text-slate-600'}`}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            <Text className="text-2xl font-black text-slate-900 mb-2">What's your budget?</Text>
            {['Budget', 'Mid-range', 'Luxury'].map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setFormData({...formData, budget: opt})}
                className={`w-full p-5 rounded-2xl border mb-3 ${formData.budget === opt ? 'bg-primary/10 border-primary' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-bold text-lg ${formData.budget === opt ? 'text-primary' : 'text-slate-800'}`}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return (
          <View>
            <Text className="text-2xl font-black text-slate-900 mb-2">Just a moment...</Text>
            <Text className="text-slate-500 mb-6 text-base">We are preparing your options.</Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100">
        <TouchableOpacity onPress={() => currentStep === 0 ? navigation.goBack() : setCurrentStep(c => c-1)} className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900">Create Trip</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-8">
        {renderProgress()}
        {renderStepContent()}
      </ScrollView>

      <View className="p-5 bg-white border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <TouchableOpacity 
          onPress={nextStep}
          disabled={currentStep === 0 && !formData.destination}
          className={`h-14 rounded-full items-center justify-center flex-row shadow-sm ${currentStep === 0 && !formData.destination ? 'bg-slate-300' : 'bg-primary'}`}
        >
          <Text className="text-white font-bold text-lg mr-2">{currentStep === STEPS.length - 1 ? 'Generate Itinerary' : 'Continue'}</Text>
          {currentStep < STEPS.length - 1 && <ChevronRight size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
